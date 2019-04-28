from .models import Account, Bid, BidItem, BidTask, Category, Customer, UnitType
from django.db.models import Q
from rest_framework import viewsets, generics
from rest_framework.decorators import detail_route
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login, get_user_model
from django.http import HttpResponse
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_rules.mixins import PermissionRequiredMixin
from .serializers import AccountSerializer, BidSerializer, BidItemSerializer, \
                         BidTaskSerializer, CustomerSerializer, CategorySerializer, \
                         UnitTypeSerializer, UserSerializer, LoginSerializer


class TrapDjangoValidationErrorMixin(object):
    """Mixin providing translation from Django native Validation Errors

    In order to use the validator which exists in the model, this mixin
    provides a translation from Django's ValidationError to DRF's so a
    useful response can be returned to the client
    """

    def perform_create(self, serializer):
        try:
            super().perform_create(serializer)
        except DjangoValidationError as detail:
            raise ValidationError(detail.message_dict)

    def perform_update(self, serializer):
        try:
            super().perform_update(serializer)
        except DjangoValidationError as detail:
            raise ValidationError(detail.message_dict)


class AccountViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_accounts'
    object_permission_required = 'bids.on_account'
    serializer_class = AccountSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        account = self.request.user.account
        return Account.objects.filter(id=account.id) if account else None


class BidViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_bids'
    object_permission_required = 'bids.owns_bid'
    serializer_class = BidSerializer

    def list(self, request, *args, **kwargs):
        # Don't provide the subresource links in list view
        queryset = self.get_queryset()
        to_exclude = ('biditems', 'bidtasks', 'categories')
        serializer = BidSerializer(queryset, exclude_fields=to_exclude, many=True, context={'request': request})
        return Response(serializer.data)

    def get_queryset(self):
        q = Bid.objects.all()
        if 'account_slug' in self.kwargs:
            q = q.filter(account__slug=self.kwargs['account_slug'])

        account = self.request.user.account
        return q.filter(account=account).order_by('-created_on') if account else None

    def perform_create(self, serializer):
        kwargs = {}
        if 'account_slug' in self.kwargs:
            slug = self.kwargs['account_slug']
            kwargs['account_id'] = Account.objects.get(slug=slug).id

        serializer.save(**kwargs)


class BidItemViewSet(
        TrapDjangoValidationErrorMixin,
        PermissionRequiredMixin,
        viewsets.ModelViewSet):
    permission_required = 'bids.view_bid_items'
    object_permission_required = 'bids.owns_bid_item'
    serializer_class = BidItemSerializer

    def get_queryset(self):
        q = BidItem.objects.all()
        if 'bid_pk' in self.kwargs:
            q = q.filter(bid_id=self.kwargs['bid_pk'])
        elif 'category_pk' in self.kwargs:
            q = q.filter(category_id=self.kwargs['category_pk'])

        account = self.request.user.account
        return q.filter(bid__account=account)


class BidTaskViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_bid_tasks'
    object_permission_required = 'bids.owns_bid_task'
    serializer_class = BidTaskSerializer

    def get_queryset(self):
        q = BidTask.objects.all().filter(Q(parent=None))
        if 'bid_pk' in self.kwargs:
            q = q.filter(bid_id=self.kwargs['bid_pk'])

        account = self.request.user.account
        return q.filter(bid__account=account)

    def get_object(self):
        """Custom function for detail view because queryset only returns
        tasks at root.
        """
        print(self.kwargs[self.lookup_field])
        task = BidTask.objects.get(pk=self.kwargs[self.lookup_field])
        return task


class CategoryViewSet(PermissionRequiredMixin, TrapDjangoValidationErrorMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_categories'
    object_permission_required = 'bids.owns_category'
    serializer_class = CategorySerializer

    def get_queryset(self):
        q = Category.objects.all()
        if 'bid_pk' in self.kwargs:
            q = q.filter(bid_id=self.kwargs['bid_pk'])

        account = self.request.user.account
        return q.filter(bid__account=account)


class CustomerViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_customers'
    object_permission_required = 'bids.has_customer'
    serializer_class = CustomerSerializer

    def get_queryset(self):
        q = Customer.objects.all()

        account = self.request.user.account
        return q.filter(account=account)

    @detail_route(methods=['get'])
    def bids(self, request, pk=None):
        queryset = Bid.objects.all().filter(customer_id=pk)
        serializer = BidSerializer(queryset, many=True, context={'request':request})
        return Response(serializer.data)


class UnitTypeViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_unittypes'
    object_permission_required = 'bids.owns_unittype'
    serializer_class = UnitTypeSerializer

    def get_queryset(self):
        q = UnitType.objects.all()
        account = self.request.user.account

        return q.filter(category__bid__account=account)


class UserViewSet(PermissionRequiredMixin, viewsets.ModelViewSet):
    permission_required = 'bids.view_users'
    object_permission_required = 'bids.edit_user'
    serializer_class = UserSerializer

    def get_queryset(self):
        q = get_user_model().objects.all()
        account = self.request.user.account

        return q.filter(account=account)

def get_csrf_token(request):
    if request.method == 'GET':
        get_token(request)
        return HttpResponse('')

@method_decorator(csrf_protect, name='dispatch')
class SessionLoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    def get_serializer_class(self):
        return LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            f = AuthenticationForm(data=data)
            if f.is_valid():
                auth_login(request._request, f.get_user())
                return Response({
                    'status': 'success',
                    'expiry': request.session.get_expiry_date()})
            else:
                return Response(f.errors.get_json_data(True), 401)

        return Response({'status': 'invalid_body'}, status=400)

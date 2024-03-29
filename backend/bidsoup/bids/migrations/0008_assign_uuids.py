# Generated by Django 2.0.1 on 2018-09-24 01:09

from django.db import migrations
import uuid


def assign_uuids(apps, schema_editor):
    models = ['Customer', 'Category', 'UnitType', 'BidItem', 'BidTask', 'Bid']
    for model in models:
        m = apps.get_model('bids', model)
        print('model: ', m)
        for row in m.objects.all():
            print('row: ', row.pk)
            row.uuid = uuid.uuid4()
            row.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('bids', '0007_add_uuids'),
    ]

    operations = [
        migrations.RunPython(assign_uuids, reverse_code=migrations.RunPython.noop)
    ]

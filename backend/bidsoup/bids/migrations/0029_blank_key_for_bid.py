# Generated by Django 2.0.1 on 2018-11-03 03:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bids', '0028_link_account_model'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bid',
            name='key',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
# Generated by Django 2.0.1 on 2018-09-26 04:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bids', '0014_restore_category_fk'),
    ]

    operations = [
        migrations.RenameField(
            model_name='category',
            old_name='bid_uuid',
            new_name='bid',
        ),
        migrations.RenameField(
            model_name='bidtask',
            old_name='bid_uuid',
            new_name='bid',
        ),
        migrations.RenameField(
            model_name='biditem',
            old_name='bid_uuid',
            new_name='bid',
        ),
    ]

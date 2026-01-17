"""
Management command to update descriptions for all existing product variants
"""
from django.core.management.base import BaseCommand
from django.db import connection
from apps.products.models import (
    ProductVariant, FrameVariant, StokLensVariant,
    RxLensVariant, ContactLensVariant
)


class Command(BaseCommand):
    help = 'Update descriptions for all product variants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without actually updating',
        )
        parser.add_argument(
            '--variant-type',
            type=str,
            choices=['frame', 'stok', 'rx', 'contact', 'all'],
            default='all',
            help='Type of variants to update',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        variant_type = options['variant_type']

        if dry_run:
            self.stdout.write(
                self.style.WARNING('🔄 DRY RUN MODE - No changes will be made')
            )

        # Get current tenant schema
        schema_name = connection.schema_name
        self.stdout.write(f"\n📦 Processing schema: {schema_name}")

        # Define variant types to process
        variant_models = {
            'frame': FrameVariant,
            'stok': StokLensVariant,
            'rx': RxLensVariant,
            'contact': ContactLensVariant,
        }

        if variant_type == 'all':
            models_to_process = variant_models.items()
        else:
            models_to_process = [(variant_type, variant_models[variant_type])]

        total_updated = 0
        total_failed = 0

        # Process each variant type
        for type_name, ModelClass in models_to_process:
            self.stdout.write(f"\n{'='*60}")
            self.stdout.write(f"📋 Processing {type_name.upper()} variants...")
            self.stdout.write(f"{'='*60}")

            variants = ModelClass.objects.all()
            count = variants.count()

            if count == 0:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  No {type_name} variants found")
                )
                continue

            self.stdout.write(f"Found {count} {type_name} variants")

            updated = 0
            failed = 0

            for idx, variant in enumerate(variants, 1):
                try:
                    # Get old description
                    old_desc = variant.description or "(empty)"

                    # Build new description
                    if not dry_run:
                        variant.description = variant.build_description()
                        variant.save(update_fields=['description'])
                    else:
                        # Just build without saving
                        new_desc = variant.build_description()

                    # Show progress
                    new_desc = variant.description

                    if old_desc != new_desc:
                        self.stdout.write(
                            f"  [{idx}/{count}] ✓ Updated: {variant.usku}"
                        )
                        if self.verbosity >= 2:
                            self.stdout.write(f"    Old: {old_desc[:80]}...")
                            self.stdout.write(f"    New: {new_desc[:80]}...")
                        updated += 1
                    else:
                        if self.verbosity >= 2:
                            self.stdout.write(
                                f"  [{idx}/{count}] ⊝ No change: {variant.usku}"
                            )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"  [{idx}/{count}] ✗ Failed: {variant.usku} - {str(e)}"
                        )
                    )
                    failed += 1

            # Summary for this type
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅ {type_name.upper()}: {updated} updated, {failed} failed"
                )
            )

            total_updated += updated
            total_failed += failed

        # Final summary
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(
            self.style.SUCCESS(
                f"🎉 Total: {total_updated} variants updated, {total_failed} failed"
            )
        )
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  This was a DRY RUN - no actual changes were made'
                )
            )
        self.stdout.write(f"{'='*60}\n")

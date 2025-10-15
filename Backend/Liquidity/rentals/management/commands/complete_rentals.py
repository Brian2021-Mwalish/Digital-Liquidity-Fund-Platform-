from django.core.management.base import BaseCommand
from django.utils import timezone
from rentals.models import Rental
from payment.models import Wallet


class Command(BaseCommand):
    help = 'Complete rentals that have reached their end date'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_rentals = Rental.objects.filter(
            status='active',
            end_date__lte=now
        )

        completed_count = 0
        for rental in expired_rentals:
            # Add expected return to user's wallet
            wallet, _ = Wallet.objects.get_or_create(user=rental.user)
            wallet.balance += rental.expected_return
            wallet.save(update_fields=["balance"])

            # Mark rental as completed
            rental.status = 'completed'
            rental.save()

            completed_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'Completed rental {rental.unique_id} for user {rental.user.email}, '
                    f'added {rental.expected_return} to balance'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully completed {completed_count} rentals')
        )

from django.contrib import admin
from .models import (ChartOfAccounts, GeneralJournal, JournalLine, TaxRate)

admin.site.register(ChartOfAccounts)
admin.site.register(GeneralJournal)
admin.site.register(JournalLine)
admin.site.register(TaxRate)

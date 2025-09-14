from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from decimal import Decimal
from datetime import datetime, timedelta
import random

from apps.companies.models import Company, Contact
from apps.deals.models import Stage, Deal, Task
from apps.interactions.models import Interaction
from apps.documents.models import Document, NDA

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with MVP sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating MVP seed data...')

        # Stages
        stages_data = [
            {'name': 'Sourcing', 'order': 1, 'is_closed': False, 'is_won': False, 'default_probability': Decimal('0.10')},
            {'name': 'Contacted', 'order': 2, 'is_closed': False, 'is_won': False, 'default_probability': Decimal('0.25')},
            {'name': 'LOI', 'order': 3, 'is_closed': False, 'is_won': False, 'default_probability': Decimal('0.50')},
            {'name': 'Due Diligence', 'order': 4, 'is_closed': False, 'is_won': False, 'default_probability': Decimal('0.75')},
            {'name': 'Closing', 'order': 5, 'is_closed': True, 'is_won': True, 'default_probability': Decimal('0.90')},
        ]
        for stage_data in stages_data:
            stage, created = Stage.objects.get_or_create(
                name=stage_data['name'],
                defaults=stage_data,
            )
            if created:
                self.stdout.write(f'Created stage: {stage.name}')

        # Users
        users_data = [
            {'email': 'admin@example.com', 'username': 'admin', 'first_name': 'Admin', 'last_name': 'User', 'role': 'admin', 'password': 'admin123'},
            {'email': 'associate@example.com', 'username': 'associate', 'first_name': 'John', 'last_name': 'Associate', 'role': 'associate', 'password': 'associate123'},
            {'email': 'analyst@example.com', 'username': 'analyst', 'first_name': 'Jane', 'last_name': 'Analyst', 'role': 'analyst', 'password': 'analyst123'},
        ]
        created_users = []
        for u in users_data:
            user, created = User.objects.get_or_create(
                email=u['email'],
                defaults={
                    'username': u['username'],
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                    'role': u['role'],
                    'is_staff': u['role'] == 'admin',
                    'is_superuser': u['role'] == 'admin',
                },
            )
            if created:
                user.set_password(u['password'])
                user.save()
                self.stdout.write(f'Created user: {user.email}')
            created_users.append(user)

        # Companies
        companies_data = [
            {'name': 'TechCorp Inc', 'legal_id': 'TC123456789', 'country': 'USA', 'sector': 'Technology', 'size': 'medium', 'website': 'https://techcorp.com'},
            {'name': 'FinanceFirst Ltd', 'legal_id': 'FF987654321', 'country': 'UK', 'sector': 'Financial Services', 'size': 'large', 'website': 'https://financefirst.co.uk'},
            {'name': 'HealthTech Solutions', 'legal_id': 'HT555666777', 'country': 'Germany', 'sector': 'Healthcare', 'size': 'startup', 'website': 'https://healthtech.de'},
            {'name': 'Manufacturing Co', 'legal_id': 'MC111222333', 'country': 'France', 'sector': 'Manufacturing', 'size': 'enterprise', 'website': 'https://manufacturing.fr'},
            {'name': 'RetailChain SA', 'legal_id': 'RC444555666', 'country': 'Spain', 'sector': 'Retail', 'size': 'large', 'website': 'https://retailchain.es'},
            {'name': 'EnergyPower Corp', 'legal_id': 'EP777888999', 'country': 'USA', 'sector': 'Energy', 'size': 'enterprise', 'website': 'https://energypower.com'},
            {'name': 'FoodService Inc', 'legal_id': 'FS000111222', 'country': 'Canada', 'sector': 'Food & Beverage', 'size': 'medium', 'website': 'https://foodservice.ca'},
            {'name': 'LogisticsPro', 'legal_id': 'LP333444555', 'country': 'Netherlands', 'sector': 'Logistics', 'size': 'small', 'website': 'https://logisticspro.nl'},
            {'name': 'ConsultingGroup', 'legal_id': 'CG666777888', 'country': 'Switzerland', 'sector': 'Consulting', 'size': 'medium', 'website': 'https://consultinggroup.ch'},
            {'name': 'MediaCompany', 'legal_id': 'MC999000111', 'country': 'Australia', 'sector': 'Media', 'size': 'startup', 'website': 'https://mediacompany.au'},
        ]
        created_companies = []
        for c in companies_data:
            company, created = Company.objects.get_or_create(
                legal_id=c['legal_id'],
                defaults=c,
            )
            if created:
                self.stdout.write(f'Created company: {company.name}')
            created_companies.append(company)

        # Contacts
        contact_names = [
            ('Alice', 'Johnson', 'CEO', 'c_level'), ('Bob', 'Smith', 'CTO', 'c_level'),
            ('Carol', 'Williams', 'CFO', 'c_level'), ('David', 'Brown', 'VP Sales', 'vp'),
            ('Emma', 'Davis', 'VP Marketing', 'vp'), ('Frank', 'Miller', 'Director', 'director'),
            ('Grace', 'Wilson', 'Senior Manager', 'senior'), ('Henry', 'Moore', 'Manager', 'mid'),
            ('Isabel', 'Taylor', 'Analyst', 'junior'), ('Jack', 'Anderson', 'Associate', 'junior'),
            ('Kate', 'Thomas', 'Director', 'director'), ('Luke', 'Jackson', 'VP Operations', 'vp'),
            ('Mary', 'White', 'Senior Analyst', 'senior'), ('Nick', 'Harris', 'Manager', 'mid'),
            ('Olivia', 'Martin', 'CEO', 'c_level'), ('Paul', 'Thompson', 'CTO', 'c_level'),
            ('Quinn', 'Garcia', 'CFO', 'c_level'), ('Rachel', 'Martinez', 'Director', 'director'),
            ('Steve', 'Robinson', 'VP', 'vp'), ('Tina', 'Clark', 'Manager', 'mid'),
        ]
        created_contacts = []
        for i, (first, last, role, seniority) in enumerate(contact_names):
            company = created_companies[i % len(created_companies)]
            email = f"{first.lower()}.{last.lower()}@{company.name.replace(' ', '').lower()}.com"
            contact, created = Contact.objects.get_or_create(
                email=email,
                defaults={
                    'company': company,
                    'first_name': first,
                    'last_name': last,
                    'role': role,
                    'seniority': seniority,
                    'phone': f'+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    'notes': f'Key contact at {company.name}',
                },
            )
            if created:
                self.stdout.write(f'Created contact: {contact.full_name}')
            created_contacts.append(contact)

        # Deals
        stages = {
            'Due Diligence': Stage.objects.get(name='Due Diligence'),
            'LOI': Stage.objects.get(name='LOI'),
            'Contacted': Stage.objects.get(name='Contacted'),
            'Sourcing': Stage.objects.get(name='Sourcing'),
            'Closing': Stage.objects.get(name='Closing'),
        }
        deals_data = [
            {'title': 'TechCorp Acquisition', 'company': created_companies, 'stage': stages['Due Diligence'], 'amount_estimate': Decimal('5000000.00'), 'description': 'Strategic acquisition of tech company for market expansion'},
            {'title': 'FinanceFirst Merger', 'company': created_companies, 'stage': stages['LOI'], 'amount_estimate': Decimal('15000000.00'), 'description': 'Merger opportunity in financial services sector'},
            {'title': 'HealthTech Investment', 'company': created_companies, 'stage': stages['Contacted'], 'amount_estimate': Decimal('2000000.00'), 'description': 'Investment in healthcare technology startup'},
            {'title': 'Manufacturing Buyout', 'company': created_companies, 'stage': stages['Sourcing'], 'amount_estimate': Decimal('25000000.00'), 'description': 'Management buyout opportunity in manufacturing'},
            {'title': 'Retail Chain Expansion', 'company': created_companies, 'stage': stages['Closing'], 'amount_estimate': Decimal('8000000.00'), 'description': 'Acquisition for retail chain expansion'},
        ]
        created_deals = []
        for d in deals_data:
            d['owner'] = random.choice(created_users)
            d['next_action_at'] = datetime.now() + timedelta(days=random.randint(1, 30))
            deal, created = Deal.objects.get_or_create(
                title=d['title'],
                defaults=d,
            )
            if created:
                self.stdout.write(f'Created deal: {deal.title}')
            created_deals.append(deal)

        # Interactions
        interaction_types = ['email', 'call', 'meeting', 'note']
        for i in range(10):
            interaction = Interaction.objects.create(
                deal=random.choice(created_deals),
                type=random.choice(interaction_types),
                subject=f"Sample {random.choice(interaction_types).title()} #{i+1}",
                body="This is a sample interaction about the deal progress.",
                occurred_at=datetime.now() - timedelta(days=random.randint(0, 30)),
                author=random.choice(created_users),
            )
            if i == 0:
                self.stdout.write(f'Created interaction: {interaction.subject}')

        # Tasks
        task_statuses = ['todo', 'doing', 'done']
        for i in range(8):
            task = Task.objects.create(
                deal=random.choice(created_deals) if i % 3 != 0 else None,
                title=f"Sample Task #{i+1}",
                description="This is a sample task for deal management.",
                due_at=datetime.now() + timedelta(days=random.randint(1, 14)),
                status=random.choice(task_statuses),
                assignee=random.choice(created_users),
                created_by=random.choice(created_users),
            )
            if i == 0:
                self.stdout.write(f'Created task: {task.title}')

        # NDAs (signed) with associated Document
        for i in range(3):
            deal = created_deals[i]
            content = ContentFile(b"Seed NDA placeholder", name=f"nda_seed_{i+1}.txt")
            doc = Document.objects.create(
                deal=deal,
                file=content,
                uploaded_by=random.choice(created_users),
            )
            nda = NDA.objects.create(
                deal=deal,
                counterparty='target',
                status='signed',
                file=doc,
                signed_at=datetime.now(),
                notes=f"Sample NDA for {deal.title}",
            )
            if i == 0:
                self.stdout.write(f'Created NDA: {nda}')

        self.stdout.write(self.style.SUCCESS('Successfully created MVP seed data.'))

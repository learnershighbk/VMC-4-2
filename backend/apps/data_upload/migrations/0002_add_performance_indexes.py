# Generated manually for performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_upload', '0001_initial'),
    ]

    operations = [
        # DepartmentKPI 인덱스 추가
        migrations.AddIndex(
            model_name='departmentkpi',
            index=models.Index(fields=['evaluation_year', 'employment_rate'], name='idx_department_kpi_year_employment'),
        ),
        # PublicationList 인덱스 추가
        migrations.AddIndex(
            model_name='publicationlist',
            index=models.Index(fields=['publication_date', 'journal_grade'], name='idx_publication_list_date_grade'),
        ),
        # ResearchProjectData 인덱스 추가
        migrations.AddIndex(
            model_name='researchprojectdata',
            index=models.Index(fields=['funding_agency'], name='idx_research_project_funding_agency'),
        ),
        migrations.AddIndex(
            model_name='researchprojectdata',
            index=models.Index(fields=['funding_agency', 'execution_date'], name='idx_research_project_agency_date'),
        ),
    ]


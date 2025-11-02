import { z } from "zod";

export const KPIDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string(),
  trend: z.enum(["up", "down", "stable"]),
});

export const OverviewResponseSchema = z.object({
  performance: KPIDataSchema,
  papers: KPIDataSchema,
  students: KPIDataSchema,
  budget: KPIDataSchema,
});

export type KPIData = z.infer<typeof KPIDataSchema>;
export type OverviewResponse = z.infer<typeof OverviewResponseSchema>;

export const EmploymentRateSchema = z.object({
  department: z.string(),
  college: z.string(),
  employment_rate: z.number(),
  evaluation_year: z.number(),
});

export const TechTransferRevenueSchema = z.object({
  evaluation_year: z.number(),
  department: z.string(),
  revenue: z.number(),
});

export const FacultyStatusSchema = z.object({
  department: z.string(),
  fulltime_count: z.number(),
  visiting_count: z.number(),
});

export const IntlConferenceCountSchema = z.object({
  evaluation_year: z.number(),
  department: z.string(),
  count: z.number(),
});

export const PerformanceResponseSchema = z.object({
  employment_rates: z.array(EmploymentRateSchema),
  tech_transfer_revenue: z.array(TechTransferRevenueSchema),
  faculty_status: z.array(FacultyStatusSchema),
  intl_conference_count: z.array(IntlConferenceCountSchema),
});

export type FacultyStatus = z.infer<typeof FacultyStatusSchema>;
export type IntlConferenceCount = z.infer<typeof IntlConferenceCountSchema>;

export type EmploymentRate = z.infer<typeof EmploymentRateSchema>;
export type TechTransferRevenue = z.infer<typeof TechTransferRevenueSchema>;
export type PerformanceResponse = z.infer<typeof PerformanceResponseSchema>;

// Papers Dashboard Schemas
export const JournalGradeDistributionSchema = z.object({
  journal_grade: z.enum(["SCIE", "KCI", "일반"]),
  count: z.number(),
});

export const PublicationByDepartmentSchema = z.object({
  department: z.string(),
  paper_count: z.number(),
});

export const PublicationTrendSchema = z.object({
  year: z.number(),
  month: z.number(),
  count: z.number(),
});

export const PapersResponseSchema = z.object({
  journal_grade_distribution: z.array(JournalGradeDistributionSchema),
  publication_by_department: z.array(PublicationByDepartmentSchema),
  publication_trend: z.array(PublicationTrendSchema),
});

export type JournalGradeDistribution = z.infer<typeof JournalGradeDistributionSchema>;
export type PublicationByDepartment = z.infer<typeof PublicationByDepartmentSchema>;
export type PublicationTrend = z.infer<typeof PublicationTrendSchema>;
export type PapersResponse = z.infer<typeof PapersResponseSchema>;

// Students Dashboard Schemas
export const StudentsByDepartmentSchema = z.object({
  department: z.string(),
  college: z.string(),
  student_count: z.number(),
});

export const StudentsByProgramSchema = z.object({
  program_type: z.string(),
  student_count: z.number(),
});

export const AcademicStatusStatisticsSchema = z.object({
  academic_status: z.string(),
  student_count: z.number(),
});

export const StudentsResponseSchema = z.object({
  students_by_department: z.array(StudentsByDepartmentSchema),
  students_by_program: z.array(StudentsByProgramSchema),
  academic_status_statistics: z.array(AcademicStatusStatisticsSchema),
});

export type StudentsByDepartment = z.infer<typeof StudentsByDepartmentSchema>;
export type StudentsByProgram = z.infer<typeof StudentsByProgramSchema>;
export type AcademicStatusStatistics = z.infer<typeof AcademicStatusStatisticsSchema>;
export type StudentsResponse = z.infer<typeof StudentsResponseSchema>;

// Budget Dashboard Schemas
export const ResearchBudgetExecutionSchema = z.object({
  execution_date: z.string(),
  expense_amount: z.number(),
});

export const FundingAgencyDistributionSchema = z.object({
  funding_agency: z.string(),
  total_budget: z.number(),
  executed_amount: z.number(),
  execution_rate: z.number(),
});

export const ProjectExecutionRatesSchema = z.object({
  project_number: z.string(),
  project_name: z.string(),
  total_budget: z.number(),
  executed_amount: z.number(),
  execution_rate: z.number(),
});

export const BudgetResponseSchema = z.object({
  research_budget_execution: z.array(ResearchBudgetExecutionSchema),
  funding_agency_distribution: z.array(FundingAgencyDistributionSchema),
  project_execution_rates: z.array(ProjectExecutionRatesSchema),
});

export type ResearchBudgetExecution = z.infer<typeof ResearchBudgetExecutionSchema>;
export type FundingAgencyDistribution = z.infer<typeof FundingAgencyDistributionSchema>;
export type ProjectExecutionRates = z.infer<typeof ProjectExecutionRatesSchema>;
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;


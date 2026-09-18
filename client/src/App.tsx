import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import { AboutPage, BlogDetailPage, BlogPage, CaseStudiesPage, CaseStudyDetailPage, ContactPage, FAQPage, LegalPage, PricingPage, ProductDetailPage, ProductsPage, ProjectRequestPage, ServiceDetailPage, ServicesPage, SolutionsPage } from "./pages/PublicPages";
import { AdminContentResourcePage, AdminDataPage, AdminOverviewPage, AdminRequestsPage, AdminResourcePage, AuthLandingPage, PortalListPage, PortalPage, PortalProfilePage, PortalProjectsPage } from "./pages/Workspaces";
import NotFound from "./pages/NotFound";
import AdminFinancePage from "./pages/AdminFinancePage";
import { AdminBlogCrudPage, AdminCustomersCrudPage, AdminProjectsCrudPage, AdminReportsPage } from "./pages/AdminManagementPages";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import AdminDiagnosticsPage from "./pages/AdminDiagnosticsPage";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/about" component={AboutPage} />
    <Route path="/services" component={ServicesPage} />
    <Route path="/services/:slug">{params => <ServiceDetailPage slug={params.slug} />}</Route>
    <Route path="/solutions" component={SolutionsPage} />
    <Route path="/products" component={ProductsPage} />
    <Route path="/products/:slug">{params => <ProductDetailPage slug={params.slug} />}</Route>
    <Route path="/pricing" component={PricingPage} />
    <Route path="/case-studies" component={CaseStudiesPage} />
    <Route path="/case-studies/:slug">{params => <CaseStudyDetailPage slug={params.slug} />}</Route>
    <Route path="/blog" component={BlogPage} />
    <Route path="/blog/:slug">{params => <BlogDetailPage slug={params.slug} />}</Route>
    <Route path="/contact" component={ContactPage} />
    <Route path="/start-project" component={ProjectRequestPage} />
    <Route path="/faq" component={FAQPage} />
    <Route path="/privacy"><LegalPage kind="privacy" /></Route>
    <Route path="/terms"><LegalPage kind="terms" /></Route>
    <Route path="/login" component={AuthLandingPage} />
    <Route path="/register" component={AuthLandingPage} />
    <Route path="/forgot-password">{() => <AuthLandingPage recovery />}</Route>
    <Route path="/reset-password" component={AuthLandingPage} />
    <Route path="/portal" component={PortalPage} />
    <Route path="/portal/projects" component={PortalProjectsPage} />
    <Route path="/portal/tasks"><PortalListPage section="tasks" /></Route>
    <Route path="/portal/milestones"><PortalListPage section="milestones" /></Route>
    <Route path="/portal/files"><PortalListPage section="files" /></Route>
    <Route path="/portal/invoices"><PortalListPage section="invoices" /></Route>
    <Route path="/portal/payments"><PortalListPage section="payments" /></Route>
    <Route path="/portal/support"><PortalListPage section="support" /></Route>
    <Route path="/portal/messages"><PortalListPage section="messages" /></Route>
    <Route path="/portal/notifications"><PortalListPage section="notifications" /></Route>
    <Route path="/portal/profile" component={AccountSettingsPage} />
    <Route path="/portal/settings" component={AccountSettingsPage} />
    <Route path="/admin" component={AdminOverviewPage} />
    <Route path="/admin/requests" component={AdminRequestsPage} />
    <Route path="/admin/projects" component={AdminProjectsCrudPage} />
    <Route path="/admin/tasks"><AdminResourcePage section="tasks" /></Route>
    <Route path="/admin/customers" component={AdminCustomersCrudPage} />
    <Route path="/admin/leads"><AdminRequestsPage /></Route>
    <Route path="/admin/content"><AdminDataPage section="content" /></Route>
    <Route path="/admin/services"><AdminContentResourcePage section="services" /></Route>
    <Route path="/admin/products"><AdminContentResourcePage section="products" /></Route>
    <Route path="/admin/case-studies"><AdminContentResourcePage section="case-studies" /></Route>
    <Route path="/admin/invoices"><AdminResourcePage section="invoices" /></Route>
    <Route path="/admin/payments"><AdminResourcePage section="payments" /></Route>
    <Route path="/admin/income"><AdminResourcePage section="payments" /></Route>
    <Route path="/admin/expenses"><AdminResourcePage section="expenses" /></Route>
    <Route path="/admin/finance" component={AdminFinancePage} />
    <Route path="/admin/salaries"><AdminResourcePage section="team" /></Route>
    <Route path="/admin/suppliers"><AdminResourcePage section="settings" /></Route>
    <Route path="/admin/support"><AdminResourcePage section="support" /></Route>
    <Route path="/admin/messages"><AdminResourcePage section="messages" /></Route>
    <Route path="/admin/notifications"><AdminResourcePage section="notifications" /></Route>
    <Route path="/admin/blog" component={AdminBlogCrudPage} />
    <Route path="/admin/testimonials"><AdminContentResourcePage section="testimonials" /></Route>
    <Route path="/admin/faq"><AdminContentResourcePage section="faq" /></Route>
    <Route path="/admin/team"><AdminResourcePage section="team" /></Route>
    <Route path="/admin/analytics"><AdminResourcePage section="analytics" /></Route>
    <Route path="/admin/reports" component={AdminReportsPage} />
    <Route path="/admin/files"><AdminResourcePage section="settings" /></Route>
    <Route path="/admin/audit-logs"><AdminResourcePage section="audit-logs" /></Route>
    <Route path="/admin/settings"><AdminResourcePage section="settings" /></Route>
    <Route path="/admin/diagnostics" component={AdminDiagnosticsPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><LanguageProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></LanguageProvider></ThemeProvider></ErrorBoundary>;
}

export default App;

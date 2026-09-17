import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import { AboutPage, BlogDetailPage, BlogPage, CaseStudiesPage, CaseStudyDetailPage, ContactPage, FAQPage, LegalPage, PricingPage, ProductDetailPage, ProductsPage, ProjectRequestPage, ServiceDetailPage, ServicesPage, SolutionsPage } from "./pages/PublicPages";
import { AdminDataPage, AdminOverviewPage, AdminRequestsPage, AuthLandingPage, PortalListPage, PortalPage, PortalProjectsPage } from "./pages/Workspaces";
import NotFound from "./pages/NotFound";

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
    <Route path="/forgot-password" component={AuthLandingPage} />
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
    <Route path="/portal/profile"><PortalListPage section="messages" /></Route>
    <Route path="/portal/settings"><PortalListPage section="notifications" /></Route>
    <Route path="/admin" component={AdminOverviewPage} />
    <Route path="/admin/requests" component={AdminRequestsPage} />
    <Route path="/admin/projects"><AdminDataPage section="projects" /></Route>
    <Route path="/admin/tasks"><AdminDataPage section="projects" /></Route>
    <Route path="/admin/customers"><AdminDataPage section="customers" /></Route>
    <Route path="/admin/content"><AdminDataPage section="content" /></Route>
    <Route path="/admin/services"><AdminDataPage section="content" /></Route>
    <Route path="/admin/products"><AdminDataPage section="content" /></Route>
    <Route path="/admin/case-studies"><AdminDataPage section="content" /></Route>
    <Route path="/admin/invoices"><AdminDataPage section="content" /></Route>
    <Route path="/admin/payments"><AdminOverviewPage /></Route>
    <Route path="/admin/expenses"><AdminOverviewPage /></Route>
    <Route path="/admin/finance"><AdminOverviewPage /></Route>
    <Route path="/admin/support"><AdminRequestsPage /></Route>
    <Route path="/admin/messages"><AdminRequestsPage /></Route>
    <Route path="/admin/notifications"><AdminOverviewPage /></Route>
    <Route path="/admin/blog"><AdminDataPage section="content" /></Route>
    <Route path="/admin/testimonials"><AdminDataPage section="content" /></Route>
    <Route path="/admin/faq"><AdminDataPage section="content" /></Route>
    <Route path="/admin/team"><AdminDataPage section="customers" /></Route>
    <Route path="/admin/analytics"><AdminOverviewPage /></Route>
    <Route path="/admin/audit-logs"><AdminOverviewPage /></Route>
    <Route path="/admin/settings"><AdminDataPage section="content" /></Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><LanguageProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></LanguageProvider></ThemeProvider></ErrorBoundary>;
}

export default App;

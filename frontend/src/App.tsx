import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Services from "./pages/Services";
import CaseStudies from "./pages/CaseStudies";
import RequestAssessment from "./pages/RequestAssessment";

const About = lazy(() => import("./pages/About"));
const Architecture = lazy(() => import("./pages/Architecture"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Account = lazy(() => import("./pages/Account"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Demo = lazy(() => import("./pages/Demo"));
const Docs = lazy(() => import("./pages/Docs"));
const Enforce = lazy(() => import("./pages/Enforce"));
const Ethics = lazy(() => import("./pages/Ethics"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const LayerCreate = lazy(() => import("./pages/LayerCreate"));
const LayerDetail = lazy(() => import("./pages/LayerDetail"));
const Layers = lazy(() => import("./pages/Layers"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Product = lazy(() => import("./pages/Product"));
const Research = lazy(() => import("./pages/Research"));
const ScanDetail = lazy(() => import("./pages/ScanDetail"));
const ScanHistory = lazy(() => import("./pages/ScanHistory"));
const Security = lazy(() => import("./pages/Security"));
const Signup = lazy(() => import("./pages/Signup"));
const Terms = lazy(() => import("./pages/Terms"));
const Tools = lazy(() => import("./pages/Tools"));
const UseCases = lazy(() => import("./pages/UseCases"));
const Why = lazy(() => import("./pages/Why"));
const WhyKnowYourAI = lazy(() => import("./pages/WhyKnowYourAI"));
const WhatsUnique = lazy(() => import("./pages/WhatsUnique"));

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools" element={<Tools />} />
          <Route path="product" element={<Product />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="use-cases" element={<UseCases />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="why" element={<Why />} />
          <Route path="why-knowyourai" element={<WhyKnowYourAI />} />
          <Route path="why-akrivon" element={<Navigate to="/why-knowyourai" replace />} />
          <Route path="whats-unique" element={<WhatsUnique />} />
          <Route path="services" element={<Services />} />
          <Route path="request" element={<RequestAssessment />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="scans" element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
          <Route path="scans/:scanId" element={<ProtectedRoute><ScanDetail /></ProtectedRoute>} />
          <Route path="layers" element={<ProtectedRoute><Layers /></ProtectedRoute>} />
          <Route path="layers/new" element={<ProtectedRoute><LayerCreate /></ProtectedRoute>} />
          <Route path="layers/:layerId" element={<ProtectedRoute><LayerDetail /></ProtectedRoute>} />
          <Route path="enforce" element={<ProtectedRoute><Enforce /></ProtectedRoute>} />
          <Route path="intentscan" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
          <Route path="demo" element={<Navigate to="/intentscan" replace />} />

          <Route path="security" element={<Security />} />
          <Route path="trust" element={<Navigate to="/security" replace />} />
          <Route path="ethics" element={<Ethics />} />

          <Route path="docs" element={<Docs />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="research" element={<Research />} />

          <Route path="about" element={<About />} />
          <Route path="careers" element={<Navigate to="/about" replace />} />
          <Route path="contact" element={<Contact />} />

          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="changelog" element={<Navigate to="/tools" replace />} />

          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="cookies" element={<Cookies />} />

          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from './pages/Dashboard';
import { GenerateDescription } from './pages/GenerateDescription';
import { BatchGenerator } from './pages/BatchGenerator';
import { ProductCatalogue } from './pages/ProductCatalogue';
import { ProductReview } from './pages/ProductReview';
import { Analytics } from './pages/Analytics';
import { BrandSettingsPage } from './pages/BrandSettings';
import { ResponsibleAI } from './pages/ResponsibleAI';
import { HelpDocs } from './pages/HelpDocs';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="generate" element={<GenerateDescription />} />
            <Route path="batch" element={<BatchGenerator />} />
            <Route path="catalogue" element={<ProductCatalogue />} />
            <Route path="catalogue/:id" element={<ProductReview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<BrandSettingsPage />} />
            <Route path="responsible-ai" element={<ResponsibleAI />} />
            <Route path="help" element={<HelpDocs />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;

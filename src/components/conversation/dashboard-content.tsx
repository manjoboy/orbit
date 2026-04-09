'use client';

import { useOrbit } from '../orbit-app';
import { SalesDashboard } from '../dashboards/sales-dashboard';
import { ProductDashboard } from '../dashboards/product-dashboard';
import { EngineeringDashboard } from '../dashboards/engineering-dashboard';
import { FinanceDashboard } from '../dashboards/finance-dashboard';

export function DashboardContent() {
  const { persona } = useOrbit();

  switch (persona) {
    case 'sales': return <SalesDashboard />;
    case 'product': return <ProductDashboard />;
    case 'engineering': return <EngineeringDashboard />;
    case 'finance': return <FinanceDashboard />;
    default: return <SalesDashboard />;
  }
}

// Script to fix all Supabase references in admin pages
const fs = require('fs');
const path = require('path');

const adminFiles = [
  'src/pages/admin/EmailTemplates.jsx',
  'src/pages/admin/SMTPSettings.jsx',
  'src/pages/admin/Tickets.jsx',
  'src/pages/admin/TicketsDashboard.jsx',
  'src/pages/admin/Listings.jsx',
  'src/pages/admin/UserAccessManager.jsx',
  'src/pages/admin/GrantFeatureAccess.jsx',
  'src/pages/admin/AdminManagerDetails.jsx',
  'src/pages/admin/SMSSettings.jsx',
  'src/pages/admin/Logout.jsx',
  'src/pages/admin/PaymentGatewaySettings.jsx'
];

const replacements = [
  {
    from: "import { supabase } from '../../supabase';",
    to: "import config from '../../config/api.js';"
  },
  {
    from: "import { supabase } from \"../../supabase\";",
    to: "import config from \"../../config/api.js\";"
  },
  {
    from: "const { data, error } = await supabase",
    to: "const response = await fetch(config.getUrl(config.endpoints.admin.stats), { credentials: 'include' });\n      const data = await response.json();\n      if (!response.ok) throw new Error(data.error || 'API Error');"
  }
];

console.log('Admin Supabase references to fix:');
adminFiles.forEach(file => {
  console.log(`- ${file}`);
});

console.log('\nReplacements to apply:');
replacements.forEach(replacement => {
  console.log(`- ${replacement.from} -> ${replacement.to}`);
});

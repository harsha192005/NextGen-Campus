import User from '../models/User.js';

export const ensureAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL || 'harsha7411156@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Harsha#19';

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.adminRole = 'super_admin';
    existing.permissions = ['*'];
    existing.status = 'active';
    existing.password = password;
    existing.name = existing.name || 'Super Admin';
    await existing.save();
    return;
  }

  await User.create({
    name: 'Super Admin',
    email,
    password,
    role: 'admin',
    adminRole: 'super_admin',
    permissions: ['*'],
    status: 'active',
    department: 'Administration',
  });

  console.log(`Admin user created: ${email}`);
};

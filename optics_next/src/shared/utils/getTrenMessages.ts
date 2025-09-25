import { notFound } from 'next/navigation';
export async function getTrenMessages(locale: string) {
    try {
      const common = (await import(`@/src/messages/${locale}/common.json`)).default;
      const formGenerator = (await import(`@/src/messages/${locale}/formGenerator.json`)).default;
      const register = (await import(`@/src/messages/${locale}/register.json`)).default;
      const tenants = (await import(`@/src/messages/${locale}/tenants.json`)).default;
    //   const dashboard = (await import(`@/messages/${locale}/dashboard.json`)).default;
  
      return { ...common, ...formGenerator, register, tenants };
    } catch (error) {
      notFound();
    }
  }
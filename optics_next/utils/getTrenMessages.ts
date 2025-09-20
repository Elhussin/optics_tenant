import { notFound } from 'next/navigation';
export async function getTrenMessages(locale: string) {
    try {
      const common = (await import(`@/messages/${locale}/common.json`)).default;
      const formGenerator = (await import(`@/messages/${locale}/formGenerator.json`)).default;
    //   const dashboard = (await import(`@/messages/${locale}/dashboard.json`)).default;
  
      return { ...common, ...formGenerator };
    } catch (error) {
      notFound();
    }
  }
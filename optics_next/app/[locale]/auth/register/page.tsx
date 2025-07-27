

import LoginForm from '@/components/forms/LoginForm';
import { getSubdomainServer } from '@/lib/utils/getSubdomainServer';
import {getTranslations} from 'next-intl/server';
import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import {formRequestProps} from '@/types';

export const metadata: Metadata = generateMetadata({
  title: 'Register',
  description: 'Register to O-S-M',
  keywords: ['optical', 'system', 'management', 'O-S-M','Register',"بصريات","ادارة"],
  openGraphType: 'website',
  twitterCardType: 'summary',
});



export default async function RegisterPage({params}: {params: {locale: string}}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'register'});
  const t2 = await getTranslations({locale, namespace: 'tenants'});
  const subdomain = await getSubdomainServer();

  const props : formRequestProps = {
    alias: "users_register_create",
    submitText: t("button"),
    mode: "create",
    title: t("title"),
    message: t("message"),
    istenant: false,
  };

  if(!subdomain){
    props.alias = "tenants_register_create";
    props.message = t2("message");
    props.istenant = true;
    props.title = t2("title");
    props.submitText = t2("button");
  }

  return (

      <LoginForm 
      istenant={props.istenant}
      alias={props.alias}
      submitText={props.submitText}
      mode="create"
      title={props.title}
      message={props.message}     
      />
  );
}


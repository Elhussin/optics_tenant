"use client";
import React from "react";
import { cn } from "@/lib/utils/cn"; // دالة لدمج الكلاسات إن كنت تستخدمها
import { ButtonProps } from "@/types";
import { X, Trash2, Pencil, ArrowLeft, Eye, Check,TimerReset,
   Plus, Copy, Printer, FileText } from "lucide-react";
import { BaseButtonProps } from "@/types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export  function Button(props: ButtonProps) {
  const { label, onClick, variant = "primary", icon, className = "", type = "button", title, disabled } = props

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    success: "btn-success",
    info: "btn-info",
    outline: "btn-outline",
    link: "btn-link",
    reset: "btn-reset",
    cancel: "btn-cancel",
    close: "btn-close",
    warning: "btn-warning",

  };

  return (
    <button
      onClick={onClick ?? (() => { })}
      type={type}
      title={title}
      disabled={disabled}
      className={cn("btn cursor-pointer", variantClasses[variant], className)}
    >
      {icon}
      {label}
    </button>
  );
}


export function CloseButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label=""
      icon={<X size={20} />}
      onClick={onClick ?? (() => { })}
      variant="close"
      title={t('close')}
    />
  );
}

export function DeactivateButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('deactivate')}
      icon={<X size={16} />}
      onClick={onClick ?? (() => { })}
      variant="secondary"
      title={t('deactivate')}
    />
  );
}

export function DeleteButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('delete')}
      icon={<Trash2 size={16} />}
      onClick={onClick ?? (() => { })}
      variant="danger"
      title={t('delete')}
    />
  );
}

      // <EditButton onClick={() => goTo({ id: item.id, action: "edit" })} label={form.updateTitle} />
export function EditButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('edit')}
      icon={<Pencil size={16} />}
      onClick={onClick ?? (() => { })}
      variant="primary"
      title={t('edit')}
    />
  );
}

export function HardDeleteButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('hardDelete')}
      icon={<Trash2 size={16} />}
      onClick={onClick}
      variant="danger"
      title={t('hardDelete')}
    />
  );
}

export function RestoreButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('restore')}
      title={t('delatetitle')}
      icon={<ArrowLeft size={16} />}
      onClick={onClick ?? (() => { })}
      variant="secondary"
    />
  );
}

export function ViewButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('view')}
      icon={<Eye size={16} />}
      onClick={onClick ?? (() => { })}
      variant="info"
      title={t('view')}
    />
  );
}

export function ActivateButton({ onClick }: BaseButtonProps) {
  const t = useTranslations('button');
  return (
    <Button
      label={t('activate')}
      icon={<Check size={16} />}
      onClick={onClick ?? (() => { })}
      variant="success"
      title={t('activate')}
    />
  );
}

export const BackButton = () => {
  const router = useRouter();
  const t = useTranslations('button');
  return <Button
    label={t('back')}
    onClick={() => router.back()}
    variant="primary"
    icon={<ArrowLeft size={16} />}
    className="md:mt-0 mt-4"
    title={t('back')}
  />
}


export const CreateButton = ({ onClick, label }: BaseButtonProps) => {
  const t = useTranslations('button');
  return (
    <Button
      label={label || t('create')}
      title={label || t('create')}
      onClick={onClick ?? (() => { })}

      variant="primary"
      icon={<Plus size={16} />}
      className="md:mt-0 mt-4"
    />
  )
}

export const CopyButton = ({ onClick }: BaseButtonProps) => {
  const t = useTranslations('button');
  return (
    <Button
      label={t('copy')}
      title={t('copy')}
      onClick={onClick ?? (() => { })}
      variant="primary"
      icon={<Copy size={16} />}
      className="md:mt-0 mt-4"
    />
  )
}

export const PrintButton = ({ onClick }: BaseButtonProps) => {
  const t = useTranslations('button');
  return (
    <Button
      label={t('print')}
      title={t('print')}
      onClick={onClick ?? (() => { })}
      variant="primary"
      icon={<Printer size={16} />}
      className="md:mt-0 mt-4"
    />
  )
}

export const PDFButton = ({ onClick }: BaseButtonProps) => {
  const t = useTranslations('button');
  return (
    <Button
      label={t('pdf')}
      title={t('pdf')}
      onClick={onClick ?? (() => { })}
      variant="primary"
      icon={<FileText size={16} />}
      className="md:mt-0 mt-4"
    />
  )
}

export const RestButton=({ onClick }: BaseButtonProps) => {
  const t = useTranslations('button');
  return (
    <Button
      label={t('rest')}
      title={t('rest')}
      icon={<TimerReset size={16} />}
      onClick={onClick ?? (() => { })}
      variant="secondary"
    />
  );
}

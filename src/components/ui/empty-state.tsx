"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
};

export const EmptyState = ({
  title = "데이터가 없습니다",
  description = "아직 데이터가 없습니다. 데이터를 업로드해주세요.",
  actionLabel,
  actionHref,
  onAction,
  className,
  icon,
}: EmptyStateProps) => {
  const Icon = icon || <FileText className="h-12 w-12 text-muted-foreground" />;

  const ActionButton = actionLabel ? (
    actionHref ? (
      <Button asChild variant="default">
        <Link href={actionHref}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    ) : onAction ? (
      <Button onClick={onAction} variant="default">
        <Plus className="mr-2 h-4 w-4" />
        {actionLabel}
      </Button>
    ) : null
  ) : null;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4">{Icon}</div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {ActionButton}
      </CardContent>
    </Card>
  );
};


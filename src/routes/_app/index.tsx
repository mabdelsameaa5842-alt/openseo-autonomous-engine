import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/serverFunctions/projects";
import {
  clearLastProjectId,
  getLastProjectId,
} from "@/client/lib/active-project";
import {
  getErrorCode,
  getStandardErrorMessage,
} from "@/client/lib/error-messages";
import { AuthConfigErrorCard } from "@/client/components/AuthConfigErrorCard";
import { UnauthenticatedErrorCard } from "@/client/components/UnauthenticatedErrorCard";
import { SUBSCRIBE_ROUTE } from "@/shared/billing";

export const Route = createFileRoute("/_app/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  const { data, error, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    retry: false,
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const lastProjectId = getLastProjectId();
    const target = data.find((project) => project.id === lastProjectId);
    if (lastProjectId && !target) {
      clearLastProjectId();
    }

    const targetId = (target ?? data[0]).id;
    try {
      void navigate({
        to: "/p/$projectId",
        params: { projectId: targetId },
      });
    } catch {}
    // Rock-solid fallback
    if (window.location.pathname === "/") {
      window.location.href = `/p/${targetId}`;
    }
  }, [data, navigate]);

  useEffect(() => {
    if (getErrorCode(error) !== "PAYMENT_REQUIRED") {
      return;
    }

    void navigate({ href: SUBSCRIBE_ROUTE });
  }, [error, navigate]);

  useEffect(() => {
    // Safety auto-redirect: Never allow the user to be stuck on root spinner for more than 2s
    const safetyTimer = setTimeout(() => {
      if (window.location.pathname === "/") {
        const fallbackId = getLastProjectId() || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
        window.location.href = `/p/${fallbackId}`;
      }
    }, 2000);

    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (isError && getErrorCode(error) !== "PAYMENT_REQUIRED") {
      const fallbackId = getLastProjectId() || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
      const timer = setTimeout(() => {
        void navigate({
          to: "/p/$projectId",
          params: { projectId: fallbackId },
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isError, error, navigate]);

  if (isError) {
    const errorCode = getErrorCode(error);

    if (errorCode === "AUTH_CONFIG_MISSING") {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <AuthConfigErrorCard
            message={getStandardErrorMessage(
              error,
              "An unexpected error occurred. Please check server logs.",
            )}
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
      );
    }

    if (errorCode === "UNAUTHENTICATED") {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <UnauthenticatedErrorCard
            message="Please sign in to access your OpenSEO organization."
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
      );
    }

    if (errorCode === "PAYMENT_REQUIRED") {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <div className="flex flex-col items-center gap-3 max-w-xl text-center">
            <p className="text-base-content/80">
              Redirecting you to billing so you can start a hosted subscription.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex flex-col items-center gap-4 max-w-xl text-center">
          <div className="p-5 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-md space-y-3">
            <h3 className="text-sm font-bold text-[var(--apple-text-primary)]">
              جاري الانتقال التلقائي إلى لوحة تحكم إعلانات فوردر العضوية...
            </h3>
            <p className="text-xs text-[var(--apple-text-secondary)]">
              يتم الآن توجيه جلستك للمشروع المعتمد للمنظومة
            </p>
            <button
              type="button"
              onClick={() => {
                const targetId = getLastProjectId() || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
                void navigate({
                  to: "/p/$projectId",
                  params: { projectId: targetId },
                });
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              الدخول المباشر للمشروع والحملات 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <span className="loading loading-spinner loading-md" />
    </div>
  );
}

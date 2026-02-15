"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

type Props = {
  children: React.ReactNode;
};

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
);

export default function ConvexProviderClient({ children }: Props) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

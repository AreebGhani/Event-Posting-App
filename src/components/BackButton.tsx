"use client";

import Link from "next/link";

import { Icon } from "./Icon";

export const BackButton = () => (
  <Link
    href="/all-posts"
    className="flex items-center text-gray-400 hover:text-white mb-6 font-semibold"
  >
    <Icon path="M15 19l-7-7 7-7" className="w-5 h-5 mr-1" />
    Back to Posts
  </Link>
);

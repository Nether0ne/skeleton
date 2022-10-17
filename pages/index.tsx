import { ProcessImageForm } from "@/components/forms/ProcessImage";
import { MainLayout } from "@/components/layout/Main";
import useSwr from "swr";
import type { NextPage } from "next";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const { data, error } = useSwr<void>("/api/img/decolorize", fetcher);

  return (
    <MainLayout>
      <ProcessImageForm />
    </MainLayout>
  );
};

export default Home;

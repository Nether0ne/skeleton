import { ProcessImageForm } from "@components/forms/ProcessImage";
import { MainLayout } from "@components/layout/Main";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <MainLayout>
      <ProcessImageForm />
    </MainLayout>
  );
};

export default Home;

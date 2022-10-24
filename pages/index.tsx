import { CustomHead } from "@components/layout/Head";
import { ProcessImageForm } from "@components/forms/ProcessImage";
import { MainLayout } from "@components/layout/Main";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <CustomHead pageName={"Image Skeleton Generation"} />
      <MainLayout>
        <ProcessImageForm />
      </MainLayout>
    </>
  );
};

export default Home;

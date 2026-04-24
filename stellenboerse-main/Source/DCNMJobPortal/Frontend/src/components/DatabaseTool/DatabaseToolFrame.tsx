import * as React from "react";
import { checkPrivilege } from "../../apiReceive/receiveEmployer";
import { Route, Routes, useParams, useNavigate } from "react-router-dom";
import EmployerList from "./EmployerList";
import Menu from "./Menu";
import NewEmployer from "./NewEmployer";
import NewLocation from "./NewLocation";
import EmployerTool from "./EmployerTool";
import KeywordTool from "./KeywordTool";
import JobList from "./JobList";

export default function DatabaseToolFrame(): React.ReactElement {
  const [IS_ALLOWED, SET_IS_ALLOWED]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    React.useState();
  const NAVIGATE: ReturnType<typeof useNavigate> = useNavigate();

  let { privilege } = useParams<{ privilege: string }>();

  function goToMain() {
    NAVIGATE(`/tool/${privilege}`);
  }

  React.useEffect(function () {
    async function checkData() {
      try {
        if (await checkPrivilege(privilege)) {
          SET_IS_ALLOWED(true);
        }
      } catch {
        console.log("Internal server error");
      }
    }
    if (privilege) {
      checkData();
    }
  }, []);

  return IS_ALLOWED ? (
    <>
      <header className="w-full bg-blue-800 py-2">
        <div className="flex justify-center">
          <button className="text-3xl font-bold text-gray-100 text-center" onClick={goToMain}>
            Database Tool
          </button>
        </div>
      </header>
      <div className="flex flex-col min-h-screen bg-gray-100 items-center pb-8">
        <div className="w-[85%] py-4">
          <Routes>
            <Route path="/" element={<Menu privilege={privilege} />} />
            <Route path="employers" element={<EmployerList privilege={privilege} />} />
            <Route path="employers/:ID" element={<EmployerTool />} />
            <Route path="keyword" element={<KeywordTool />} />
            <Route path="addemployer" element={<NewEmployer />} />
            <Route path="addlocation" element={<NewLocation />} />
            <Route path="jobs" element={<JobList />} />
          </Routes>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}

export interface IMenuProps {
  privilege: string;
}

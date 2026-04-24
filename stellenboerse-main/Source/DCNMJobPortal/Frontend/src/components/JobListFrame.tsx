import * as React from "react";
import { useState, useEffect, ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Frame from "./Dialog";
import JobListItems from "./JobListItems";
import { IJob, IFilterData, IFilterResponse } from "../Interfaces/types";
import { LanguageIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import i18n from "../i18n/i18n";
import { fetchJobs, fetchOneJob } from "../apiReceive/receiveJob";
import TitleSearch from "./TitleSearch";
import FilterButton from "./FilterElements/FilterButton";
import FilterControl from "./FilterControl";
import SortControl from "./SortControl";
import ActiveFilters from "./ActiveFilters";
import PageBar from "./PageBar";
import Toast from "./Toast";

function JobListFrame(): ReactElement {
  const NAVIGATE: ReturnType<typeof useNavigate> = useNavigate();
  const LOCATION: ReturnType<typeof useLocation> = useLocation();
  const [JOBS, SET_JOBS]: [IJob[], React.Dispatch<React.SetStateAction<IJob[]>>] = useState<IJob[]>(
    [],
  );
  const [SELECTED_JOB, SET_SELECTED_JOB]: [
    IJob | null,
    React.Dispatch<React.SetStateAction<IJob | null>>,
  ] = useState<IJob | null>(null);
  const [INTERNAL_ERROR, SET_INTERNAL_ERROR]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false);
  const [LOADING, SET_LOADING]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(true);

  const [LANGUAGE, SET_LANGUAGE]: [string, React.Dispatch<React.SetStateAction<string>>] =
    useState<string>(i18n.language);

  const [FILTER_DATA, SET_FILTER_DATA]: [
    IFilterData,
    React.Dispatch<React.SetStateAction<IFilterData>>,
  ] = useState<IFilterData>({
    userSpecialty: "",
    userLanguage: "",
    userEmployernames: [],
  userSortOrder: "DESC",
  userSortMode: "created_at",
    userSearchterms: [],
    userPage: 0,
  });

  const [IS_FILTER_OPEN, SET_IS_FILTER_OPEN]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState<boolean>(false);

  const [COUNT, SET_COUNT]: [number, React.Dispatch<React.SetStateAction<number>>] = useState();

  const [SHOW_TOAST, SET_SHOW_TOAST]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);
  const [TOAST_MESSAGE, SET_TOAST_MESSAGE]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
  ] = useState<string>("");
  const [PREVIOUS_FILTER_DATA, SET_PREVIOUS_FILTER_DATA]: [
    IFilterData | null,
    React.Dispatch<React.SetStateAction<IFilterData | null>>,
  ] = useState<IFilterData | null>(null);

  useEffect(
    function (): void {
      fetchData();
    },
    [FILTER_DATA],
  );

  useEffect(
    function () {
      function handleLanguageChange(lng: string): void {
        SET_LANGUAGE(lng);
      }
      i18n.on("languageChanged", handleLanguageChange);

      return function () {
        i18n.off("languageChanged", handleLanguageChange);
      };
    },
    [LANGUAGE],
  );

  function changeLanguage(): void {
    const LNG: string = i18n.language;
    i18n.changeLanguage(LNG === "de" ? "en" : "de");
  }

  async function fetchData(): Promise<void> {
    try {
      SET_LOADING(true);
      let response: IFilterResponse = await fetchJobs(FILTER_DATA);
      let jobs: IJob[] = response.jobs;
      SET_JOBS(jobs);
      SET_COUNT(response.count);

      // Show toast if filters changed
      if (PREVIOUS_FILTER_DATA) {
        const MESSAGE = getFilterChangeMessage(PREVIOUS_FILTER_DATA, FILTER_DATA);
        if (MESSAGE) {
          SET_TOAST_MESSAGE(MESSAGE);
          SET_SHOW_TOAST(true);
        }
      }
      SET_PREVIOUS_FILTER_DATA(FILTER_DATA);

      const JOBID: string = LOCATION.pathname.split("/job/")[1];

      if (JOBID && jobs.length > 0) {
        try {
          const JOB: IJob | null = await fetchOneJob(Number(JOBID));
          SET_SELECTED_JOB(JOB);
        } catch (error) {
          console.log(error);
        }
      } else {
        SET_SELECTED_JOB(null);
      }
    } catch {
      SET_INTERNAL_ERROR(true);
    } finally {
      SET_LOADING(false);
    }
  }

  function getFilterChangeMessage(prev: IFilterData, current: IFilterData): string {
    // Count how many filters changed
    let changesCount = 0;
    if (current.userSearchterms.length !== prev.userSearchterms.length) changesCount++;
    if (current.userSpecialty !== prev.userSpecialty) changesCount++;
    if (current.userLanguage !== prev.userLanguage) changesCount++;
    if (current.userEmployernames.length !== prev.userEmployernames.length) changesCount++;

    // If multiple filters changed at once (e.g., "Reset All" was clicked), show generic message
    if (changesCount > 1) {
      // Check if all filters were cleared
      const allCleared = 
        current.userSearchterms.length === 0 &&
        current.userSpecialty === "" &&
        current.userLanguage === "" &&
        current.userEmployernames.length === 0;
      
      if (allCleared) {
        return t("toast.filtersCleared");
      }
      return t("toast.filtersChanged");
    }

    // Single filter changes
    if (current.userSearchterms.length > prev.userSearchterms.length) {
      const NEW_TERM = current.userSearchterms[current.userSearchterms.length - 1];
      return `${t("toast.searchTermAdded")}: "${NEW_TERM}"`;
    }
    if (current.userSearchterms.length < prev.userSearchterms.length) {
      return t("toast.searchTermRemoved");
    }
    if (current.userSpecialty !== prev.userSpecialty) {
      return current.userSpecialty ? t("toast.specialtyChanged") : t("toast.specialtyRemoved");
    }
    if (current.userLanguage !== prev.userLanguage) {
      return current.userLanguage ? t("toast.languageChanged") : t("toast.languageRemoved");
    }
    if (current.userEmployernames.length !== prev.userEmployernames.length) {
      return current.userEmployernames.length > prev.userEmployernames.length
        ? t("toast.employerAdded")
        : t("toast.employerRemoved");
    }
    if (current.userSortMode !== prev.userSortMode || current.userSortOrder !== prev.userSortOrder) {
      return t("toast.sortChanged");
    }
    if (current.userPage !== prev.userPage) {
      return ""; // No toast for page changes
    }
    return t("toast.filterApplied");
  }

  function openDialog(job: IJob): void {
    SET_SELECTED_JOB(job);
    NAVIGATE(`/job/${job.JobID}`);
  }

  function closeDialog(): void {
    SET_SELECTED_JOB(null);
    NAVIGATE("/");
  }

  return (
    <div className="min-h-screen min-w-[450px] bg-gray-50 flex">
      <div className="w-full max-w-screen-2xl px-[5%] font-roboto p-8 mx-auto">
        <div className="flex justify-between relative mb-8">
          <h1 className="font-bold text-dunkelblau">{t("jobListFrame.ads")}</h1>
          <p className="absolute right-10 font-bold text-dunkelblau">{t("jobListFrame.language")}</p>
          <LanguageIcon
            className="w-7 h-7 text-dunkelblau hover:text-orange transition-transform duration-200"
            onClick={changeLanguage}
          />
        </div>

        <div className="w-full flex flex-wrap gap-4">
          <TitleSearch filterData={FILTER_DATA} setFilterData={SET_FILTER_DATA} />
          <FilterButton setIsFilterOpen={SET_IS_FILTER_OPEN} isOpen={IS_FILTER_OPEN} />
        </div>

        {IS_FILTER_OPEN && (
          <div className="w-full justify-items-center p-4 bg-white rounded-xl shadow-lg border-2 animate-fadeIn mt-4">
            <FilterControl filterData={FILTER_DATA} setFilterData={SET_FILTER_DATA} />
            <hr className="my-4 border-t border-gray-200" />
            <SortControl filterData={FILTER_DATA} setFilterData={SET_FILTER_DATA} />
          </div>
        )}

        <ActiveFilters filterData={FILTER_DATA} setFilterData={SET_FILTER_DATA} />
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-scale-md text-textbody font-medium">
                {COUNT} {t("jobListFrame.adsFound")}
              </span>
            </div>
          </div>

          <div>
            {!LOADING &&
              !INTERNAL_ERROR &&
              JOBS.map(function (job: IJob): ReactElement {
                return (
                  <JobListItems
                    key={job.JobID}
                    job={job}
                    onClick={function (): void {
                      openDialog(job);
                    }}
                  />
                );
              })}

            {LOADING && (
              <div className="p-12 text-center animate-pulse">
                <div className="inline-block p-4 rounded-full bg-hellblau/10">
                  <svg className="w-8 h-8 text-dunkelblau animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {!LOADING && !INTERNAL_ERROR && !COUNT && (
              <div className="p-8 text-center text-textbody">
                <p>{t("jobListFrame.noJobsFound")}</p>
              </div>
            )}

            {!LOADING && INTERNAL_ERROR && (
              <div className="p-8 text-center text-textbody">
                <p>{t("jobListFrame.serverError")}</p>
              </div>
            )}
          </div>
        </div>
        <PageBar filterData={FILTER_DATA} setFilterData={SET_FILTER_DATA} totalCount={COUNT} />
      </div>
      <Frame isOpen={!!SELECTED_JOB} job={SELECTED_JOB} onClose={closeDialog} />
      {SHOW_TOAST && (
        <Toast
          message={TOAST_MESSAGE}
          count={COUNT || 0}
          onClose={() => SET_SHOW_TOAST(false)}
        />
      )}
    </div>
  );
}

export default JobListFrame;

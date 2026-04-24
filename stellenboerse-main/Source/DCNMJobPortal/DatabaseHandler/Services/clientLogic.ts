import { Job } from "../Models/Entities/Job";

export function sort(jobs: Job[], sortmode: string, sortorder: "ASC" | "DESC") {
  if (sortmode == "ApplicationDeadline") {
    return sortJobsByDeadline(jobs, sortorder);
  }
  if (sortmode == "Title") {
    return sortJobsByTitle(jobs, sortorder);
  }
  if (sortmode == "created_at") {
    return sortJobsByCreatedDate(jobs, sortorder);
  }
  return [];
}

export function sortJobsByTitle(jobs: Job[], order: "ASC" | "DESC") {
  const SORTED_JOBS: Job[] = [...jobs].sort(function (leftJob: Job, rightJob: Job): number {
    const LEFT_JOB_TITLE: string = leftJob.Title.toUpperCase();
    const RIGHT_JOB_TITLE: string = rightJob.Title.toUpperCase();

    if (order === "ASC") {
      return LEFT_JOB_TITLE.localeCompare(RIGHT_JOB_TITLE);
    }
    {
      return RIGHT_JOB_TITLE.localeCompare(LEFT_JOB_TITLE);
    }
  });

  return SORTED_JOBS;
}

export function sortJobsByDeadline(jobs: Job[], order: "ASC" | "DESC") {
  const SORTED_JOBS: Job[] = [...jobs].sort(function (left: Job, right: Job): number {
    if (!left.ApplicationDeadline && !right.ApplicationDeadline) {
      return 0;
    }

    if (!left.ApplicationDeadline) {
      return 1;
    }

    if (!right.ApplicationDeadline) {
      return -1;
    }

    let leftDeadline: number = left.ApplicationDeadline.setHours(0, 0, 0, 0);
    let rightDeadline: number = right.ApplicationDeadline.setHours(0, 0, 0, 0);

    if (order === "ASC") {
      return leftDeadline - rightDeadline;
    } else {
      return rightDeadline - leftDeadline;
    }
  });

  return SORTED_JOBS;
}

export function sortJobsByCreatedDate(jobs: Job[], order: "ASC" | "DESC") {
  const SORTED_JOBS: Job[] = [...jobs].sort(function (left: Job, right: Job): number {
    let leftCreatedDate: number = new Date(left.created_at).setHours(0, 0, 0, 0);
    let rightCreatedDate: number = new Date(right.created_at).setHours(0, 0, 0, 0);

    if (order === "ASC") {
      return leftCreatedDate - rightCreatedDate;
    } else {
      return rightCreatedDate - leftCreatedDate;
    }
  });

  return SORTED_JOBS;
}

export function paginate(jobs: Job[], page: number) {
  let offset: number = page * 20;
  return jobs.slice(offset, offset + 20);
}

export const profileKey = "scu-linkin-profile";

export type ExperienceEntry = {
  id: string;
  organization: string;
  title: string;
  period: string;
  description: string;
};

export type CredentialEntry = {
  id: string;
  type: "證照" | "語言能力";
  name: string;
  issuerOrLevel: string;
  date: string;
};

export type Profile = {
  displayName: string;
  avatarDataUrl: string;
  visibilityMode: "公開" | "隱身";
  role: "學生" | "校友" | "教職員";
  studyProgram: "未填寫" | "日間部" | "進修部" | "碩士在職專班" | "其他";
  gender: "未填寫" | "女性" | "男性" | "非二元／其他" | "不願透露";
  militaryService: "未填寫" | "不適用" | "免役" | "役畢" | "服役中" | "待役";
  department: string;
  secondaryStudyType: "無" | "雙主修" | "輔系";
  secondaryStudyName: string;
  program: string;
  campus: string;
  graduationYear: string;
  bio: string;
  experiences: ExperienceEntry[];
  credentials: CredentialEntry[];
  skills: string;
  careerInterest: string;
  opportunityStatus: "開放實習機會" | "開放正職機會" | "探索中" | "暫不開放";
};

export const defaultProfile: Profile = {
  displayName: "",
  avatarDataUrl: "",
  visibilityMode: "隱身",
  role: "學生",
  studyProgram: "未填寫",
  gender: "未填寫",
  militaryService: "未填寫",
  department: "",
  secondaryStudyType: "無",
  secondaryStudyName: "",
  program: "",
  campus: "",
  graduationYear: "",
  bio: "",
  experiences: [],
  credentials: [],
  skills: "",
  careerInterest: "",
  opportunityStatus: "探索中",
};

export type SocialIdentity = {
  label: string;
  avatarLabel: string;
  usesDepartmentAvatar: boolean;
  hidesPersonalInformation: boolean;
};

// Keep the privacy rule in one place so future social cards and posts cannot
// accidentally render a name or uploaded avatar for an anonymous member.
export function getSocialIdentity(profile: Profile): SocialIdentity {
  if (profile.visibilityMode === "隱身") {
    const department = profile.department || "東吳同學";
    return {
      label: department,
      avatarLabel: profile.department ? profile.department.slice(0, 2) : "SCU",
      usesDepartmentAvatar: true,
      hidesPersonalInformation: true,
    };
  }

  return {
    label: profile.displayName.trim() || "未設定名稱",
    avatarLabel: profile.displayName.trim().charAt(0) || "？",
    usesDepartmentAvatar: false,
    hidesPersonalInformation: false,
  };
}

export function readProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const saved = localStorage.getItem(profileKey);
    if (!saved) return defaultProfile;
    const stored = JSON.parse(saved) as Partial<Profile> & { doubleMajor?: string; minor?: string; experience?: string; certifications?: string };
    const legacySecondary = stored.doubleMajor ? { secondaryStudyType: "雙主修" as const, secondaryStudyName: stored.doubleMajor } : stored.minor ? { secondaryStudyType: "輔系" as const, secondaryStudyName: stored.minor } : {};
    const legacyExperiences = typeof stored.experience === "string" && stored.experience ? [{ id: "legacy-experience", organization: "", title: "既有經歷", period: "", description: stored.experience }] : [];
    const legacyCredentials = typeof stored.certifications === "string" && stored.certifications ? [{ id: "legacy-credential", type: "證照" as const, name: stored.certifications, issuerOrLevel: "", date: "" }] : [];
    return { ...defaultProfile, ...stored, ...legacySecondary, experiences: stored.experiences ?? legacyExperiences, credentials: stored.credentials ?? legacyCredentials };
  } catch {
    return defaultProfile;
  }
}

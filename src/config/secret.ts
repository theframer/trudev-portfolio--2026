export type SecretAction =
  | {
      type: "file";
      title: string;
      description: string;
      url: string;
    }
  | {
      type: "link";
      title: string;
      description: string;
      url: string;
    };

export const SECRET_CODE = "TRUDEV";

export const SECRET_ACTION: SecretAction = {
    type: "file",
    title: "DOWNLOAD",
    description: "You found the hidden layer.",
    url: "/downloads/ZOHO Academy Syllabus_Syllabus.pdf",
  };
export interface Annotation {
  id: string;
  target: string;
  section: string;
  label: string;
  selector: string;
  outerHtml: string;
  text: string;
  timestamp: number;
}

export interface FeedbackEntry {
  id: string;
  sourceFile: string;
  pageTitle: string;
  pageUrl: string;
  annotations: Annotation[];
  receivedAt: number;
  processed: boolean;
}

export interface ResponseEntry {
  id: string;
  feedbackId: string;
  message: string;
  sentAt: number;
  delivered: boolean;
}

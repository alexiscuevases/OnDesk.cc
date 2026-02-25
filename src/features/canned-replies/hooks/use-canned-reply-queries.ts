import { createWorkspaceScopedQueryHooks } from "@/lib/crud-hooks";
import { apiGetCannedReplies, apiGetCannedReply } from "../api/canned-replies-api";

const { queryKeys, useAll, useById } = createWorkspaceScopedQueryHooks(
	"canned-replies",
	{ getAll: apiGetCannedReplies, getById: apiGetCannedReply }
);

export const cannedReplyQueryKeys = queryKeys;
export const useCannedReplies = useAll;
export const useCannedReply = useById;

import { IconBlock } from "@components/icons/icon-block";
import { icons } from "@data/icon";
import useNoticeStore from "@hooks/notification/store/useNoticeStore";

export const IconInteraction = (): JSX.Element => {
  const { notifications } = useNoticeStore();

  const count = Array.isArray(notifications)
    ? notifications.filter((n) => !n?.isRead).length
    : 0;

  const unreadCount = count > 99 ? "99+" : count;
  const hasUnread = count > 0;

  return (
    <div className="icon-panel">
      <div className="icons-bar">
        <div className="icons">
          <IconBlock iteration={icons} />
          <div>
            <p className={`notice-count ${hasUnread ? 'exist' : ''}`}>
              {unreadCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
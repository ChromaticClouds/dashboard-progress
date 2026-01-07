import React, { useState, useEffect, useRef, useCallback } from "react";
import "./title.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import useMonthEventStore from "../../hooks/useMonthEvents";
import useTodoEvents from "../../hooks/useTodoEvents";

import Expand from "../../Video/Stream/Expand";
import TodoList from "../TodoList/TodoList";
import useOpenAi from "../../Video/Prediction/hooks/useOpenAi";
import { ContentPanel } from "../contents/content-panel";
import { InfoContents } from "../section/InfoContents";
import { IconInteraction } from "@components/icons/icon-interaction";

library.add(fas);

export const MainPage = () => {
  const { events } = useMonthEventStore();
  const { getTodayTodos } = useTodoEvents();
  /**
   *  - # Video 컴포넌트 및 Embed 컴포넌트의 이벤트 관리 스테이트
   */
  const [onCancel, setOnCancel] = useState(true);
  const [embed, setEmbed] = useState(<div></div>);
  const [embedError, setEmbedError] = useState(false);
  /*-----------------------------------------------------------------------------*\
    # POST 요청 성공 시, GET 요청으로 title 컴포넌트의 todo list에 데이터 삽입 #
  \*-----------------------------------------------------------------------------*/
  useEffect(() => {
    getTodayTodos();
  }, [events]);
  /**
   * AI 요청 처리
   */
  useOpenAi();

  return (
    <div>
      <Expand
        onEmbed={embed}
        onCancel={setOnCancel}
        isVisible={onCancel}
        embedError={embedError}
      />
      <TodoList />
      <div className="ui-container">
        <IconInteraction />
        <ContentPanel />
        <InfoContents />
      </div>
    </div>
  );
};

export default MainPage;

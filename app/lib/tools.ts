import { spreadsheet } from "./spreadsheet";

// Tool для чтения диапазона ячеек
export const getRangeTool = {
  description: "Прочитать диапазон ячеек из таблицы",
  parameters: {
    sheet: { type: "string", description: "Название листа" },
    from: { type: "string", description: "Начальная ячейка (например, A1)" },
    to: { type: "string", description: "Конечная ячейка (например, B3)" },
  },
  execute: async ({ sheet, from, to }: { sheet: string; from: string; to: string }) => {
    try {
      const data = spreadsheet.getRange(sheet, from, to);
      return {
        success: true,
        data,
        message: `Данные из диапазона ${sheet}!${from}:${to}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Tool для обновления ячейки (требует подтверждения)
export const updateCellTool = {
  description: "Обновить значение ячейки в таблице (требует подтверждения)",
  parameters: {
    sheet: { type: "string", description: "Название листа" },
    cell: { type: "string", description: "Адрес ячейки (например, A1)" },
    value: { type: "string", description: "Новое значение" },
  },
  execute: async ({ sheet, cell, value }: { sheet: string; cell: string; value: string }) => {
    // Этот tool возвращает UI для подтверждения, а не выполняет действие сразу
    return {
      type: "confirmation",
      action: "updateCell",
      params: { sheet, cell, value },
      message: `Вы уверены, что хотите изменить ячейку ${sheet}!${cell} на "${value}"?`,
    };
  },
};

// Tool для удаления данных (требует подтверждения)
export const deleteDataTool = {
  description: "Удалить данные из диапазона ячеек (требует подтверждения)",
  parameters: {
    sheet: { type: "string", description: "Название листа" },
    from: { type: "string", description: "Начальная ячейка" },
    to: { type: "string", description: "Конечная ячейка" },
  },
  execute: async ({ sheet, from, to }: { sheet: string; from: string; to: string }) => {
    return {
      type: "confirmation",
      action: "deleteRange",
      params: { sheet, from, to },
      message: `Вы уверены, что хотите удалить данные из диапазона ${sheet}!${from}:${to}?`,
    };
  },
};

// Tool для получения формулы ячейки
export const getFormulaTool = {
  description: "Получить формулу ячейки",
  parameters: {
    sheet: { type: "string", description: "Название листа" },
    cell: { type: "string", description: "Адрес ячейки" },
  },
  execute: async ({ sheet, cell }: { sheet: string; cell: string }) => {
    try {
      const formula = spreadsheet.getCellFormula(sheet, cell);
      const value = spreadsheet.getCell(sheet, cell);
      
      return {
        success: true,
        formula,
        value,
        message: `Ячейка ${sheet}!${cell}: значение=${value}, формула=${formula || "нет"}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Tool для отправки приглашений (имитация)
export const sendInvitationsTool = {
  description: "Отправить приглашения по email",
  parameters: {
    emails: { type: "array", items: { type: "string" }, description: "Список email адресов" },
    subject: { type: "string", description: "Тема письма" },
    message: { type: "string", description: "Текст сообщения" },
  },
  execute: async ({ emails, subject, message }: { emails: string[]; subject: string; message: string }) => {
    // Имитация отправки
    console.log("Отправка приглашений:", { emails, subject, message });
    
    return {
      success: true,
      message: `Приглашения отправлены ${emails.length} адресатам: ${emails.join(", ")}`,
    };
  },
};

// Экспортируем все tools для useChat
export const tools = {
  getRange: getRangeTool,
  updateCell: updateCellTool,
  deleteData: deleteDataTool,
  getFormula: getFormulaTool,
  sendInvitations: sendInvitationsTool,
};

// lib/momentHijri.ts
import HijriDate from 'hijri-date';

const moment = (dateInput?: Date | string | number) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const hijri = new HijriDate(date);

  return {
    format: (formatString: string) => {
      const day = hijri.getDate();
      const month = hijri.getMonth() + 1;
      const year = hijri.getFullYear();

      if (formatString === "iYYYY/iM/iD") {
        return `${year}/${month}/${day}`;
      }
      if (formatString === "iDD/iMM/iYYYY") {
        const dd = day < 10 ? '0' + day : day;
        const mm = month < 10 ? '0' + month : month;
        return `${dd}/${mm}/${year}`;
      }

      return hijri.toString();
    }
  };
};

export default moment;

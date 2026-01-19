import { HolidayUtil, Solar } from 'lunar-typescript'

export function getLunarDate(date) {
  try {
    // 将公历日期转换为 Solar 对象
    const solar = Solar.fromDate(date)
    // 转换为农历对象
    const lunar = solar.getLunar()

    // 获取农历月（如：正月、冬月、闰二月）
    const month = lunar.getMonthInChinese()
    // 获取农历日（如：初一、十五）
    const day = lunar.getDayInChinese()

    // 获取干支年份（如：乙巳）
    const yearGanzhi = lunar.getYearInGanZhiByLiChun()
    const jieQi = lunar.getJieQi()
    const festivals = lunar.getFestivals()
    const solarFestivals = solar.getFestivals()

    // 获取节日或节气
    const allFestivals = [...festivals, ...solarFestivals]
    const festival = allFestivals.length > 0 ? allFestivals[0] : (jieQi || '')

    const holiday = HolidayUtil.getHoliday(solar.getYear(), solar.getMonth(), solar.getDay())
    const holidayLabel = holiday ? (holiday.isWork() ? '班' : '休') : undefined

    return {
      date: day,
      year: yearGanzhi,
      month,
      yearShengxiao: lunar.getYearShengXiao(),
      monthGanzhi: lunar.getMonthInGanZhi(),
      dayInChinese: day,
      dayGanzhi: lunar.getDayInGanZhi(),
      isFestival: !!festival,
      festival,
      holiday: holidayLabel,
    }
  }
  catch (e) {
    console.error('Lunar date error (lunar-typescript):', e)
    return {
      fullDate: '加载失败',
      date: '加载失败',
      year: '--年',
      month: '加载失败',
      yearShengxiao: '--',
      monthGanzhi: '--',
      dayInChinese: '--',
      dayGanzhi: '--',
      isFestival: false,
    }
  }
}

/**
 * 获取完整的黄历详细信息（宜忌、冲煞、时辰吉凶等）
 * 该操作较耗时，应仅在需要显示详情时调用
 */
export function getAlmanacDetails(date) {
  try {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()

    return {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      chong: lunar.getDayChongDesc(),
      sha: lunar.getDaySha(),
      wuxing: lunar.getBaZiWuXing()[4], // 日柱五行
      pengzu: [lunar.getPengZuGan(), lunar.getPengZuZhi()],
      hours: lunar.getTimes().slice(0, 12).map(t => ({
        hour: `${t.getZhi()}时`,
        ganzhi: t.getGanZhi(),
        luck: t.getTianShenLuck(),
        tianShen: t.getTianShen(),
        js: t.getYi().join(' '),
        xs: t.getJi().join(' '),
      })),
    }
  }
  catch (e) {
    console.error('Almanac details error:', e)
    return {}
  }
}

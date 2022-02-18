/* global window */
/* eslint "no-magic-numbers": ["error", {"ignore": [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 12, 15, 24, 30, 36, 60, 100, 1000, 365]}]*/

import React, { Fragment } from 'react'
import Badge from 'react-bootstrap/Badge'

import * as ResponseStatus from '../Entities/ResponseStatus'
import { ALARM_DATE_FORMAT, END_PERIOD, PARSE_DATE_FORMAT, PARSE_MINUTELY_DATE_FORMAT, PARSE_HOURLY_DATE_FORMAT,
    PARSE_DAILY_DATE_FORMAT, START_PERIOD, MANUAL_DATA_DATE_FORMAT, TELEMETRY_DATE, MANUAL_DATA_TIME_FORMAT } from '../Entities/InventoryContainerConstants'
import { QUERY_STRING_DATE_TYPE, GRAPH_LABEL, REFILL_TYPE_TTP, REFILL_TYPE_TT, REFILL_TYPE_TTR } from '../Entities/InventorySiteConstants'
import { INTERVAL } from '../Entities/CartTypes'
import { INVENTORY_REPORT, INVENTORY_REPORT_MONTH_TYPE } from '../Entities/ReportTypes'
import { COMMENTS_DATE_FORMAT, DOWNLOAD_FILE_TIMEOUT } from '../Entities/AlarmDetailTypes'
import { ORDERS_DETAILS_DATE } from '../Entities/OrderTypes'
import { DATETIME_INETERVAL } from '../Entities/InventoryTypes'
import { DUE_DATE } from '../Entities/ServiceRequests'
import * as moment from 'moment'
import { APPLICATION_FLOWMETERS, PRIMARY_WATER_FLOWMETER, PRODUCTIO_RATE } from '../Entities/ApplicationDetailTypes'
import { MCA_I } from '../Entities/CentralizedChart'

if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = className => {
        const matches = (this.document || this.ownerDocument).querySelectorAll(className)

        let i

        let element = this

        do {
            i = matches.length
            while (--i >= 0 && matches.item(i) !== element) {} // eslint-disable-line
        } while ((i < 0) && (element = element.parentElement))
        return element
    }
}

export const getChemicalProductLabel = (description = '', name, key) => (
    <Fragment key={key}>
        {description}
        <Badge className="ml-1 ow-badge-chemical" variant="primary">{name}</Badge>
    </Fragment>
)

export const filterFromList = (entity, list = [], fullItem = false) =>
    list
        .filter(item => item[entity])
        .map(item => fullItem ? item : (item.id || item.name))

export const filterFromSelectedList = (list = {}, objectKey = 'id') =>
    Object.keys(list)
        .map(key => list[key][objectKey])

export const isObjectWithKey = obj => obj !== null && Object.entries(obj).length > 0 && obj.constructor === Object

export const checkUnauthorizedStatus = error => {
    const { response: { status = ResponseStatus.SUCCESS } } = error

    return status === ResponseStatus.UNAUTHORIZED
}

export const groupByKey = (arrayList, groupByKey) => {
    return arrayList.reduce((accumulator, reducer) => {
        (accumulator[reducer[groupByKey]] = accumulator[reducer[groupByKey]] || []).push(reducer)
        return accumulator
    }, {})
}

export const stringifyData = data => JSON.stringify(data)

export const parseData = data => JSON.parse(data)

export const convertEpochDate = value => {
    const utcSeconds = value
    const date = new Date(0) // for epoch conversion\

    date.setUTCSeconds(utcSeconds)
    return date
}

export const parseDateFromString = value => {
    return moment.unix(parseInt(value)).format('D[-]M[-]YYYY HH[:]mm[:]ss')
}

// eslint-disable-next-line max-statements
export const parseDate = (value, type = '', isChartDate = false) => {
    const timeStamp = isChartDate ? Date.parse(convertEpochDate(value)) : Date.parse(value)

    if (isNaN(timeStamp)) {
        return '-'
    }
    const date = new Date(timeStamp)
    const monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
    const day = date.getDate()
    const monthIndex = date.getMonth()
    const year = date.getFullYear().toString()
    const paddedHour = ('0' + date.getHours()).slice(-2)
    const paddedMinute = ('0' + date.getMinutes()).slice(-2)
    const paddedSeconds = ('0' + date.getSeconds()).slice(-2)
    const paddedDay = String(day).padStart(2, 0)
    const paddedMonth = ('0' + (monthIndex + 1)).slice(-2)
    const paddedYear = year.toString().substr(-2)

    let finalDate = `${monthNames[monthIndex]} ${day}, ${year} ${paddedHour}:${paddedMinute}:${paddedSeconds}`

    if (type === QUERY_STRING_DATE_TYPE) {
        finalDate = `${year}-${monthIndex < 9 ? 0 : ''}${monthIndex + 1}-${day < 10 ? 0 : ''}${day}`
    } else if (type === GRAPH_LABEL) {
        finalDate = `${day} ${monthNames[monthIndex]} ${year}`
    } else if (type === PARSE_DATE_FORMAT) {
        return `${year}-${monthIndex + 1}-${day}`
    } else if (type === ALARM_DATE_FORMAT) {
        return `${year}-${monthIndex + 1}-${day} ${paddedHour}:${paddedMinute}:${paddedSeconds}`
    } else if (type === MANUAL_DATA_DATE_FORMAT) {
        return `${year}-${('0' + (monthIndex + 1)).slice(-2)}-${('0' + day).slice(-2)}`
    } else if (type === INVENTORY_REPORT) {
        return `${paddedMonth}/${day}`
    } else if (type === INVENTORY_REPORT_MONTH_TYPE) {
        return `${monthNames[monthIndex]} ${year}`
    } else if (type === COMMENTS_DATE_FORMAT) {
        return `${monthIndex + 1}-${day}-${year} ${paddedHour}:${paddedMinute}:${paddedSeconds}`
    } else if (type === TELEMETRY_DATE) {
        return `${day < 10 ? 0 : ''}${day}-${monthIndex < 9 ? 0 : ''}${monthIndex + 1}-${year}`
    } else if (type === PARSE_MINUTELY_DATE_FORMAT) {
        return `${paddedDay}/${paddedMonth}/${paddedYear} ${paddedHour}:${paddedMinute}`
    } else if (type === PARSE_HOURLY_DATE_FORMAT) {
        return `${paddedDay}/${paddedMonth}/${paddedYear} ${paddedHour}`
    } else if (type === PARSE_DAILY_DATE_FORMAT) {
        return `${paddedDay}/${paddedMonth}/${paddedYear}`
    } else if (type === ORDERS_DETAILS_DATE) {
        return `${monthNames[monthIndex]} ${day}, ${year}`
    } else if (type === MANUAL_DATA_TIME_FORMAT) {
        return `${paddedHour}:${paddedMinute}`
    } else if (type === DUE_DATE) {
        finalDate = `${monthNames[monthIndex]} ${day}, ${year}`
    }
    return finalDate
}

export const timeFormatAMPM = dateValue => {
    const date = new Date(dateValue)

    let hours = date.getHours()

    let minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12
    hours = hours || 12 // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes
    return (hours + ':' + minutes + ' ' + ampm)
}

export const timeFromDate = dateValue => {
    const date = new Date(dateValue)

    const hours = date.getHours()

    const minutes = date.getMinutes()

    const secs = date.getSeconds()

    return (hours * 60 * 60 + minutes * 60 + secs) * 1000

}

export const getPreviousDate = daysToSubtract => {
    const date = new Date()

    return new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000))
}

export const agoTimeFormat = (commentUtcDate, suffix = ' ago') => {
    const periods = {
        years: 12 * 30 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000
    }

    const now = new Date()
    const utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds())
    const commentedDate = new Date(commentUtcDate)
    const commentedDateFormat = new Date(commentedDate.getUTCFullYear(), commentedDate.getUTCMonth(),
        commentedDate.getUTCDate(), commentedDate.getUTCHours(), commentedDate.getUTCMinutes(), commentedDate.getUTCSeconds(), commentedDate.getUTCMilliseconds())
    const diff = utcNow.getTime() - commentedDateFormat.getTime()

    if (diff > periods.years) {
        return Math.floor(diff / periods.years) + `y${suffix}`
    } else if (diff > periods.month) {
        return Math.floor(diff / periods.month) + `m${suffix}`
    } else if (diff > periods.week) {
        return Math.floor(diff / periods.week) + `w${suffix}`
    } else if (diff > periods.day) {
        return Math.floor(diff / periods.day) + `d${suffix}`
    } else if (diff > periods.hour) {
        return Math.floor(diff / periods.hour) + `h${suffix}`
    } else if (diff > periods.minute) {
        return Math.floor(diff / periods.minute) + `m${suffix}`
    }
    return 'Just now'
}

export const stringFromObjectList = (list = []) => {
    const onsiteInventory = list.reduce((accumulator, currentValue) => {
        accumulator = accumulator || []

        if (currentValue.quantity > 0) {
            if ([ REFILL_TYPE_TT, REFILL_TYPE_TTP, REFILL_TYPE_TTR ].indexOf(currentValue.name) > -1) {
                accumulator.push(((accumulator.length === 0) ? '' : ' ') + `${currentValue.name} (${currentValue.quantity} ${currentValue.refillTypeUnit})`)
            } else {
                accumulator.push(((accumulator.length === 0) ? '' : ' ') + `${currentValue.quantity} ${currentValue.name}`)
            }
        }

        return accumulator
    }, [])

    return onsiteInventory.length > 0 ? onsiteInventory.toString() : '-'
}

export const removeKeyFromObject = (obj, key) => {
    const objectCpy = Object.assign({}, obj)

    delete objectCpy[key]
    return objectCpy
}

export const parseReadableErrorMessage = data => {
    if (isObjectWithKey(data) && data.errors) {
        if (Array.isArray(data.errors)) {
            return data.errors.map(item => (item.errorMessage))
                .join('\n') || ''
        }
    }
    if (isObjectWithKey(data) && data.error) {
        return data.error
    }
    if (isObjectWithKey(data) && data.ErrorMessage) {
        return data.ErrorMessage
    }
    return data.ErrorMessage || data.errorMessage || data
}

export const extractKeyFromJWT = (token = false, key = false) => {
    if (token && key) {
        try {
            const tokenData = token.split('.')[1]
            const tokenInformation = JSON.parse(window.atob(tokenData))

            if (Object.prototype.hasOwnProperty.call(tokenInformation, key)) {
                return tokenInformation[key] || false
            }
            return false
        } catch (error) {
            // Nothing
            console.error(error)
        }
        return false
    }
    return false
}

export const getYMDDateFormat = date => {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
}

export const convertUTCDate = (date, format) => {
    return moment.utc(date).format(format)
}

export const getYMDTDateFormat = (date, days) => {
    date = days ? new Date(date.getTime() - (days * 24 * 60 * 60 * 1000)) : date
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + 'T' + (('0' + date.getHours()).slice(-2)) + ':' + ('0' + date.getMinutes()).slice(-2)
}

/**
 * Function returning the build date(as per provided epoch)
 * @param epoch Time in milliseconds
 */
export const getBuildDate = epoch => {
    const buildDate = moment(epoch).format('DD-MM-YYY HH:MM')

    return buildDate
}

export const getTimePeriod = (date, period, days = 0) => {
    // console.info(period)
    // console.info(days.value)
    // "yyyy-MM-dd".
    if (period === START_PERIOD) {
        const previousDate = new Date(date.getTime() - (days.value * 24 * 60 * 60 * 1000))

        return previousDate.getFullYear() + '-' + ('0' + (previousDate.getMonth() + 1)).slice(-2) + '-' + ('0' + previousDate.getDate()).slice(-2)
    } else if (period === END_PERIOD) {
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
    } else if (period === INTERVAL) {
        const futureDate = new Date(date.getTime() + (days.value * 24 * 60 * 60 * 1000))

        return futureDate.getFullYear() + '-' + ('0' + (futureDate.getMonth() + 1)).slice(-2) + '-' + ('0' + futureDate.getDate()).slice(-2)
    }
}

export const getTimePeriodHourly = (date, period, days = 0) => {
    if (period === START_PERIOD) {
        const previousDate = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000))

        return ('0' + previousDate.getDate()).slice(-2) + '/' + ('0' + (previousDate.getMonth() + 1)).slice(-2) + '/' + previousDate.getFullYear().toString().substr(-2) + ' ' + ('0' + previousDate.getHours()).slice(-2) + ':' + ('0' + previousDate.getMinutes()).slice(-2)
    } else if (period === END_PERIOD) {
        return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear().toString().substr(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
    } else if (period === INTERVAL) {
        const futureDate = new Date(date.getTime() + (days * 24 * 60 * 60 * 1000))

        return ('0' + futureDate.getDate()).slice(-2) + '/' + ('0' + (futureDate.getMonth() + 1)).slice(-2) + '/' + futureDate.getFullYear().toString().substr(-2) + ' ' + ('0' + futureDate.getHours()).slice(-2) + ':' + ('0' + futureDate.getMinutes()).slice(-2)
    }
}

export const getTimePeriodDayWise = (date, period, days = 0) => {
    if (period === START_PERIOD) {
        const previousDate = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000))

        return ('0' + previousDate.getDate()).slice(-2) + '/' + ('0' + (previousDate.getMonth() + 1)).slice(-2) + '/' + previousDate.getFullYear().toString().substr(-2)
    } else if (period === END_PERIOD) {
        return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear().toString().substr(-2)
    } else if (period === INTERVAL) {
        const futureDate = new Date(date.getTime() + (days * 24 * 60 * 60 * 1000))

        return ('0' + futureDate.getDate()).slice(-2) + '/' + ('0' + (futureDate.getMonth() + 1)).slice(-2) + '/' + futureDate.getFullYear().toString().substr(-2)
    }
}

export const cloneData = data => {
    return JSON.parse(JSON.stringify(data))
}

export const combineDateAndTime = (date, time) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds())

export const getEntityFromList = (list, filterName, filterValue) =>
    list.filter(item => {
        if (item[filterName] === filterValue) {
            return item
        }
    })

export const parseDayHourTime = dayHourTime => {
    if (!dayHourTime) {
        return dayHourTime || '-'
    }

    const time = dayHourTime.split(':')
    const day = time.shift()

    if (day === '0' || day === '00') {
        return time.join(':')
    } else {
        return day + ' day(s), ' + time.join(':')
    }
}

export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-3xxx-dxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (item) {
        // eslint-disable-next-line no-bitwise
        const randomValue = Math.random() * 16 | 0
        // eslint-disable-next-line no-bitwise
        const value = item === 'x' ? randomValue : (randomValue & 0x3 | 0x8)

        return value.toString(16).substr(0, 36)
    })
}
export const getDateBeforeMonths = (date, months) => {
    date.setMonth(date.getMonth() - months)
    return date
}
export const getDateAfterMonths = (date, months) => {
    date.setMonth(date.getMonth() + months)
    return date
}

export const getOrderMinValue = propValue => {
    const { absoluteMinimum = '0', maxCapacityInGallons = '0', leadTime = '0', targetUsageRate = '0', error = '0' } = propValue

    return ((((parseInt(absoluteMinimum) / 100) * parseInt(maxCapacityInGallons)) +
        (parseInt(leadTime) * parseInt(targetUsageRate))) * (1 + parseInt(error) / 100)).toFixed(2)
}

export const incrementOrDecrementDate = (dateValue, count, isIncrement = true) => {
    if (isIncrement) {
        const date = new Date(dateValue)
        const nextDate = new Date(date.setDate(date.getDate() + count))
        const month = ('0' + (nextDate.getMonth() + 1)).slice(-2)
        const day = ('0' + nextDate.getDate()).slice(-2)

        return [ nextDate.getFullYear(), month, day ].join('-')
    } else {
        const date = new Date(dateValue)
        const nextDate = new Date(date.setDate(date.getDate() - count))
        const month = ('0' + (nextDate.getMonth() + 1)).slice(-2)
        const day = ('0' + nextDate.getDate()).slice(-2)

        return [ nextDate.getFullYear(), month, day ].join('-')
    }
}

export const arrayToString = (data, property = '', limit = 3) => {
    let str = ''

    if (data && typeof data !== 'string') {
        if (data.length > limit && limit > 0) {
            const moreLength = data.length - limit

            if (property !== '') {
                str += [...data.slice(0, limit)].map(item => item[property]).join(', ')
            } else {
                str += data.splice(0, limit).join(', ')
            }
            str += ', ' + moreLength + ' more...'
        } else {
            if (property !== '') {
                str += data.map(item => item[property]).join(', ')
            } else {
                str += data.join(', ')
            }
        }
        return str
    } else if (typeof data === 'string') {
        return data
    }
    return '-'
}

export const getNumericToRound = data => {
    if (data) {
        if (typeof data === 'string') {
            data = parseFloat(data)
        }

        return ((Math.round(data * 100) / 100).toFixed(2))
    }
    return 0
}

export const getYMSDTDateFormat = (date, days) => {
    date = days ? new Date(date.getTime() - (days * DATETIME_INETERVAL)) : date
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
}

export const downloadAttachment = (fileName, blobData) => {
    if (blobData) {
        const fileUrl = window.URL.createObjectURL(new Blob([blobData], { type: blobData.type }))
        const fileLink = document.createElement('a')

        fileLink.href = fileUrl
        fileLink.setAttribute('download', fileName)
        document.body.appendChild(fileLink)
        fileLink.click()
        setTimeout(() => {
            fileLink.remove()
        }, DOWNLOAD_FILE_TIMEOUT)
    }
}

export const exportCSVFile = (headers, items, fileTitle) => {
    if (headers) {
        items.unshift(headers)
    }
    const commaSeparatedStringArray = items.map(item => {
        return Object.values(item).toString()
    }).join('\n')
    const exportedFilename = fileTitle ? fileTitle + '.csv' : 'export.csv'
    const blob = new Blob(['\uFEFF' + commaSeparatedStringArray], { type: 'text/csv;charset=utf-8;' })

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilename)
    } else {
        const link = document.createElement('a')

        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob)

            link.setAttribute('href', url)
            link.setAttribute('download', exportedFilename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
        }
        setTimeout(() => {
            link.remove()
        }, DOWNLOAD_FILE_TIMEOUT)
    }
}

export const getDateFromStringFormat = (item, type) => {
    const extractDate = item.split(' ')[0]

    if (extractDate) {
        const dateFormat = extractDate.split('/')

        if (type === PARSE_DATE_FORMAT) {
            return new Date(dateFormat[2] + '-' + dateFormat[1] + '-' + dateFormat[0])
        }
        return new Date(dateFormat[1] + '-' + dateFormat[0] + '-' + dateFormat[2])
    }
    return ''
}

export const isDataValid = item => item !== null && item !== undefined

export const getUtcDate = cartDate => {
    const formattedDate = cartDate.replace(/-/g, '/')
    const timeZone = (new Date().getHours() * 60 * 60) + (new Date().getMinutes() * 60) + new Date().getSeconds()
    const newTimeFormat = new Date(new Date(formattedDate).setSeconds(timeZone))

    return newTimeFormat.toISOString()
}

export const formatVpConfigurationData = (obj, listName, sectionName, tag, listDetail) => {
    return obj[listName].reduce((acc, list) => {
        acc[list[sectionName]] = list[listDetail].reduce((acc1, item) => {
            acc1[item[tag]] = { ...item }
            return acc1
        }, {})
        return acc
    }, {})
}

export const getApplicationConfigData = (items, tagName, tagValue) => {
    let data = ''

    items.map(item => {
        if (item.TagName === tagName) {
            data = item[tagValue]
        }
    })
    return data
}

export const formatWasherAndDefoamerObject = titanConfig => {
    return titanConfig.loopDetail.reduce((loopFormData, loopConfigName) => {
        loopFormData[loopConfigName.configSectionName] = loopConfigName.loopConfigDetail.reduce((loopFormTag, item) => {
            loopFormTag[item.tag] = { ...item }
            return loopFormTag
        }, {})
        return loopFormData
    }, {})
}

export const formatTelemetryConfigData = titanConfig => {
    return titanConfig.telemetry.reduce((loopFormTag, item) => {
        loopFormTag[item.tag] = { ...item }
        return loopFormTag
    }, {})
}

export const pascalCaseOfWord = string => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const getAliasName = (firstName, lastName) => {
    return firstName && firstName.charAt(0) + ((lastName && lastName.charAt(0)) || '')
}

export const getDateTimeFormat = date => {
    const newDate = new Date(date)

    let month = '' + (newDate.getMonth() + 1)

    let day = '' + newDate.getDate()

    const year = newDate.getFullYear()

    if (month.length < 2) { month = '0' + month }
    if (day.length < 2) { day = '0' + day }

    return [ year, month, day ].join('-')
}

export const getFutureDate = daysToAdd => {
    const date = new Date()

    return new Date(date.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
}

export const appendReadOnlyValues = (readOnlyValues = [], selectedData) => {
    const readOnlyIds = readOnlyValues.map(item => item.value)

    let updatedNewSelectedData = selectedData && selectedData.filter(item => !readOnlyIds.includes(item.value))

    updatedNewSelectedData = [ ...readOnlyValues, ...updatedNewSelectedData ]
    return updatedNewSelectedData
}

export const convertToFixed = num => {
    return num === 0 ? 0 : num ? Number(num).toFixed(2) : '-'
}

export const convertFormValueToFixed = (num, maxSigDigit = 2) => {
    const convertedNum = String(num)

    if (convertedNum.toLowerCase().includes('e')) { // if exponential value
        return parseFloat(convertedNum).toFixed(2)
    }

    const splitNum = convertedNum.split('.') // split num into decimal and float

    if (splitNum.length > 1) { // if floating part exists
        if (splitNum[1].length > maxSigDigit) { // if floating part > Max.Significant.Digits
            return parseFloat(convertedNum.slice(0, convertedNum.indexOf('.') + maxSigDigit + 1))
        }
        return parseFloat(num)
    }
    return isValidValue(num) ? parseInt(num) : ''
}

export const isValidValue = value => {
    return (value ?? '') !== ''
}

export const base64ToFileDownload = (byteCharacters, contentType, fileName = 'output.csv') => {
    contentType = contentType || ''
    const sliceSize = 512
    // const byteCharacters = window.atob(content)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize)
        const byteNumbers = new Array(slice.length)

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)

        byteArrays.push(byteArray)
    }
    const blob = new Blob(byteArrays, {
        type: contentType
    })

    const blobURL = URL.createObjectURL(blob)
    const dlnk = document.createElement('a')

    if (dlnk) {
        dlnk.href = blobURL
        dlnk.download = fileName
        dlnk.click()
    }
}

export const temporaryUnitValueChanges = (records, data, parameterId, unit, value, columnName) => {
    if (columnName === APPLICATION_FLOWMETERS || columnName === PRIMARY_WATER_FLOWMETER) {
        const keys = Object.keys(data)
        const tempData = { sectionName: columnName }

        keys.forEach(key => {
            if (Array.isArray(data[key])) {
                const temporaryRow = data[key].map((row, index) => {
                    if (row && row.parameterId === parameterId) {
                        return {
                            ...row,
                            unit: unit,
                            currentValue: records[key][index]?.currentValue * value
                        }
                    } else {
                        return row
                    }
                })

                tempData[key] = temporaryRow
            }
        })
        return tempData
    } else if (columnName === PRODUCTIO_RATE) {
        const tempData = data.map((record, index) => {
            if (record.parameterId === parameterId) {
                if (record?.variable === PRODUCTIO_RATE) {
                    return {
                        ...record,
                        unit: unit,
                        average: records[index].average * value,
                        lowerLimit: records[index].lowerLimit * value,
                        upperLimit: records[index].upperLimit * value,
                        maximum: records[index].maximum * value,
                        minimum: records[index].minimum * value,
                        pv: records[index].pv * value
                    }
                } else {
                    return {
                        ...record,
                        unit: unit,
                        setPoint: records[index].setPoint * value,
                        presentValue: records[index].presentValue * value,
                        output: records[index].output * value
                    }
                }
            } else {
                return record
            }
        })

        return tempData

    } else if (columnName.columnName === 'yAxis') {
        const fullObject = cloneData(data)
        const temporaryData = data?.yAxis?.map((yAxis, yIndex) => {
            return {
                ...yAxis,
                unit,
                dataSeries: yAxis.dataSeries.map((dataSeries, dataSeriesIndex) => {
                    let temporaryYIndex

                    records.yAxis.map((yAxis, yIndex) =>
                        yAxis.dataSeries.map(recordDataSeries => {
                            if (recordDataSeries.dataSeriesId === dataSeries.dataSeriesId) {
                                temporaryYIndex = yIndex
                            }
                        }))

                    if (parameterId === dataSeries.parameterId) {
                        return {
                            ...dataSeries,
                            data: {
                                ...dataSeries?.data,
                                data: dataSeries?.data?.data?.map((data, dataIndex) => {
                                    if (data.value !== null) {
                                        return {
                                            ...data,
                                            value: records?.yAxis[temporaryYIndex]?.dataSeries[dataSeriesIndex].data?.data[dataIndex]?.value * value
                                        }
                                    } else {
                                        return {
                                            ...data
                                        }
                                    }
                                }),
                                component: {
                                    ...dataSeries.data.component,
                                    unit
                                }
                            }
                        }
                    } else {
                        return dataSeries
                    }
                })
            }
        })

        fullObject.yAxis = temporaryData
        return fullObject

    } else {
        const temporaryData = data.map((record, index) => {
            if (record && isObjectWithKey(record[columnName]) && record[columnName]?.parameterId === parameterId) {
                return {
                    ...record,
                    [columnName]: {
                        ...record[columnName],
                        unit: unit,
                        value: records[index][columnName]?.value * value
                    }
                }
            } else if (record && !isObjectWithKey(record[columnName]) && record?.limitsParameterId === parameterId) {
                return {
                    ...record,
                    limitsUnit: unit,
                    currentValue: records[index][columnName] * value
                }
            } else {
                return record
            }
        })

        return temporaryData
    }
}

// Truncate limit value to 2 decimal places
export const truncateUptoTwoDigit = value => {
    return Math.trunc(Number(value * 100)) / 100
}

export const getTimeDifference = (startDate, endDate) => {
    const duration = moment.duration(moment(endDate).diff(moment(startDate)))

    return { minutes: duration.asMinutes(), hours: duration.asHours(), days: duration.asDays() }
}

// eslint-disable-next-line max-statements
export const getChartBinning = (binningKeys, applicationName) => {
    let binning = {}
    const { Day, Hour, Minute } = binningKeys || {}

    if (applicationName === MCA_I) {
        return { year: [], month: [], day: [], hour: [1] }
    }

    if (Day) {
        binning = { year: [], month: [], day: [1] }
        if (Minute) {
            binning = { day: [1], hour: [], minute: [] }
        }
        if ((Hour && Minute) || Hour) {
            binning = { hour: [1] }
        }
    } else if (Hour) {
        binning = { year: [], month: [], day: [], hour: [1] }
    } else {
        binning = { year: [], month: [], day: [], hour: [], minute: [1], second: [], millisecond: [] }
    }

    return binning
}

export const getsyncFusionTablePagination = tableData => {
    const totalRecordsCount = tableData.pagerModule.pageSettings.properties.totalRecordsCount

    const currentPage = tableData.pagerModule.pageSettings.properties.currentPage

    const pageSize = tableData.pagerModule.pageSettings.properties.pageSize

    const totalPages = (totalRecordsCount + pageSize - 1) / pageSize

    const starting = ((currentPage - 1) * pageSize) + 1

    const ending = (currentPage === Math.trunc(totalPages)) ? totalRecordsCount : ((currentPage - 1) * pageSize) + pageSize

    tableData.element.querySelector('.e-pagecountmsg').innerText = ' of ' + totalRecordsCount

    tableData.element.querySelector('.e-pagenomsg').innerText = ' Showing ' + starting + ' to ' + ending
}

export const convertValueToFixed = (num, maxSigDigit = 2) => {
    const convertedNum = String(num)

    if (convertedNum.toLowerCase().includes('e')) { // if exponential value
        return parseFloat(Number(convertedNum)?.toFixed(2))
    }

    const splitNum = convertedNum.split('.') // split num into decimal and float

    if (splitNum.length > 1) { // if floating part exists
        if (splitNum[1].length > maxSigDigit) { // if floating part > Max.Significant.Digits
            return parseFloat(Number(convertedNum)?.toFixed(2))
        }
        return parseFloat(num)
    }
    return isValidValue(num) ? parseInt(num) : ''
}

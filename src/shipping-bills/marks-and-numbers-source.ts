export interface MarksAndNumbersOption {
  value: string
  label: string
}

const MOCK_MARKS_DELAY_MS = 180

const marksByExporter: Record<string, MarksAndNumbersOption[]> = {
  '1000': [
    { value: 'AARAV TEXTILES / MADE IN INDIA', label: 'AARAV TEXTILES / MADE IN INDIA' },
    { value: 'ATPL / LOT NO. ______', label: 'ATPL / LOT NO. ______' }
  ],
  '1002': [
    { value: 'BLUE HARBOR EXPORTS / INDIA', label: 'BLUE HARBOR EXPORTS / INDIA' },
    { value: 'BHE / SHIPPING MARKS AS PER INVOICE', label: 'BHE / SHIPPING MARKS AS PER INVOICE' }
  ],
  '1010': [
    { value: 'APEX GARMENTS / SURAT INDIA', label: 'APEX GARMENTS / SURAT INDIA' },
    { value: 'AGFPL / CTN NO. 1 UP', label: 'AGFPL / CTN NO. 1 UP' }
  ],
  '1020': [{ value: 'ZENITH SPICES / PRODUCE OF INDIA', label: 'ZENITH SPICES / PRODUCE OF INDIA' }],
  '1030': [{ value: 'TITANIUM ENG / PUNE INDIA', label: 'TITANIUM ENG / PUNE INDIA' }],
  '1040': [{ value: 'EVERGREEN ORGANICS / INDIA', label: 'EVERGREEN ORGANICS / INDIA' }],
  '1050': [{ value: 'RAJPUTANA HANDICRAFTS / JAIPUR INDIA', label: 'RAJPUTANA HANDICRAFTS / JAIPUR INDIA' }],
  '1060': [{ value: 'AMIT EXPORTS / MADE IN INDIA', label: 'AMIT EXPORTS / MADE IN INDIA' }]
}

export function getMarksAndNumbersOptions(exporterId: string): Promise<MarksAndNumbersOption[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(marksByExporter[exporterId] ?? [])
    }, MOCK_MARKS_DELAY_MS)
  })
}

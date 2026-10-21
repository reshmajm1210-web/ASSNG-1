export const sealTypes = [
  { value: 'S', label: 'S - Self sealed' },
  { value: 'A', label: 'A - Agency / Customs sealed' },
  { value: 'W', label: 'W - Warehouse / Port sealed' }
]

export const contractTypes = [
  { value: 'FOB', label: 'FOB (Free on Board)' },
  { value: 'CF', label: 'CF (Cost + Freight)' },
  { value: 'CIF', label: 'CIF (Cost + Insurance + Freight)' },
  { value: 'CI', label: 'CI - (Cost + Insurance)' }
]

export const weightUnits = [
  { value: 'KG', label: 'kg (kilogram)' },
  { value: 'g', label: 'g (gram)' },
  { value: 'MT', label: 'mt (metric ton)' },
  { value: 'lb', label: 'lb (pound)' }
]

export const paymentTypes = [
  { value: 'DP', label: 'DP (Direct payment)' },
  { value: 'AP', label: 'AP (Advance payment)' },
  { value: 'LC', label: 'LC (Letter of credit)' },
  { value: 'DA', label: 'DA (Delivery against acceptance)' },
  { value: 'NA', label: 'NA (Not applicable)' }
]

export const priceInclusionTypes = [
  { value: 'B', label: 'Freight and insurance - B' },
  { value: 'F', label: 'Freight only - F' },
  { value: 'I', label: 'Insurance only - I' },
  { value: 'N', label: 'Neither - N' }
]

export const cargoOptions = [
  { value: 'P', label: 'Packaged cargo - P' },
  { value: 'C', label: 'Containerized - C' },
  { value: 'CP', label: 'Containerized packages - CP' },
  { value: 'LB', label: 'Liquid bulk - LB' },
  { value: 'DB', label: 'Dry bulk - DB' }
]

export const currencies = ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((value) => ({ value, label: value }))

export const nfeiCategories = [
  { value: '01', label: 'Free trade sample' },
  { value: '02', label: 'Diplomatic goods' },
  { value: '03', label: 'Warranty replacement' },
  { value: '07', label: 'Gift parcel' },
  { value: '08', label: 'Other' }
]

export const containerSizes = [
  { value: '20', label: '20 ft' },
  { value: '40', label: '40 ft' },
  { value: '45', label: '45 ft' }
]

export const containerSealTypes = [
  { value: 1, label: 'BTSL - Bottle Seal' },
  { value: 2, label: 'ESEAL - Electronic Seal' },
  { value: 3, label: 'RFID - Radio Frequency Identifier' }
]

export const igstPaymentStatuses = [
  { value: 'NA', label: 'Not applicable' },
  { value: 'LUT', label: 'Under LUT / bond' },
  { value: 'P', label: 'Against payment' }
]

export const accessoryStatuses = [
  { value: '0', label: 'No accessory' },
  { value: '1', label: 'Included free of cost' },
  { value: '2', label: 'Entered separately' }
]

export const goodsSources = [
  { value: 'I', label: 'Imported' },
  { value: 'D', label: 'Indigenous' }
]

export const fileTypes = [{ value: 'pdf', label: 'PDF' }]

export const exporterClasses = [
  { value: 'F', label: 'Manufacturer' },
  { value: 'R', label: 'Merchant' },
  { value: 'C', label: 'Merchant courier' },
  { value: 'D', label: 'Manufacturer courier' }
]

export const exporterTypes = [
  { value: 'P', label: 'Private' },
  { value: 'G', label: 'Government' },
  { value: 'W', label: 'Warehouse' }
]

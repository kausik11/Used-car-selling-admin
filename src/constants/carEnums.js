export const CAR_ENUMS = {
  status: ['draft', 'active', 'sold', 'archived'],
  visibility: ['public', 'private', 'hidden'],
  fuel_type: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'],
  transmission: ['manual', 'automatic', 'amt', 'cvt', 'dct'],
  body_type: ['hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van'],
  ownership: ['first', 'second', 'third', 'fourth_plus'],
  insurance_type: ['comprehensive', 'third_party', 'zero_dep', 'none'],
  drivetrain: ['fwd', 'rwd', 'awd', '4wd'],
  tyre_condition: ['new', 'good', 'fair', 'poor'],
  airbags: ['none', 'driver', 'dual', 'curtain', 'multiple'],
  parking_sensors: ['none', 'rear', 'front_rear'],
  power_windows: ['none', 'front', 'all'],
  sunroof: ['none', 'standard', 'panoramic'],
  seat_type: ['fixed', 'folding', 'split_folding', 'captain'],
  upholstery: ['fabric', 'leather', 'leatherette'],
  safety_rating_type: ['Global NCAP', 'Bharat NCAP', 'ASEAN NCAP', 'Euro NCAP', 'NHTSA', 'IIHS'],
  media_view_type: ['exterior_360', 'interior_360', 'gallery'],
  media_gallery_category: ['exterior', 'interior', 'engine', 'tyres', 'top_features', 'extra', 'dents', 'other'],
  media_report_type: ['pdf', 'image'],
};

export const toOptions = (items) => items.map((value) => ({ value, label: value.replace(/_/g, ' ') }));

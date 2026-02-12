import { CAR_ENUMS } from '../../constants/carEnums';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getDefaultFeatures = () => ({
  safety: {
    abs: true,
    airbags: CAR_ENUMS.airbags[2],
    airbag_count: 2,
    engine_immobilizer: true,
    anti_theft_device: false,
    central_locking: true,
    headlight_height_adjuster: true,
    seat_belt_warning: true,
    ebd: true,
    speed_sensing_central_door_locking: false,
    power_door_locks: true,
    child_safety_lock: true,
    low_fuel_level_warning: true,
    door_ajar_warning: true,
    speed_alert: true,
    steering_airbag: true,
    co_passenger_airbag: true,
    safety_rating: 4,
    safety_rating_type: CAR_ENUMS.safety_rating_type[0],
    automatic_parking_assist: false,
    esp: false,
    knee_airbags: false,
    brake_assist: false,
    view_camera_360: false,
    rear_camera: true,
    active_roll_mitigation: false,
    automatic_head_lamps: false,
    cornering_headlights: false,
    follow_me_home_headlamps: false,
    tpms: false,
    hill_hold_control: false,
    parking_sensors: CAR_ENUMS.parking_sensors[1],
    child_seat_anchor_points: false,
    headlight_ignition_off_reminder: false,
    middle_rear_three_point_seatbelt: false,
    second_row_middle_rear_headrest: false,
    geo_fence_alert: false,
    side_airbags: false,
    front_torso_airbags: false,
    rear_torso_airbags: false,
    traction_control: false,
    hill_assist: false,
    custom: [],
  },
  comfort: {
    wireless_phone_charging: false,
    air_quality_control_filter: false,
    climate_control: true,
    automatic_climate_control: true,
    rear_ac: true,
    second_row_ac_vent: true,
    power_steering: true,
    air_conditioner: true,
    outlets_12v: true,
    power_windows: CAR_ENUMS.power_windows[2],
    keyless_start: false,
    keyless_entry: true,
    cruise_control: false,
    driver_height_adjustable_seat: true,
    steering_mounted_controls: true,
    armrest: true,
    folding_rear_seat: true,
    rear_seat_centre_arm_rest: true,
    seat_adjustment: true,
    glove_compartment: true,
    adjustable_orvm: true,
    seat_lumbar_support: false,
    cup_holders: true,
    trunk_cargo_lights: false,
    gear_indicator: true,
    rear_reading_lamp: true,
    tailgate_ajar_warning: true,
    digital_clock: true,
    voice_command_control: false,
    third_row_cup_holders: false,
    driver_ventilated_seat: false,
    electrically_adjustable_orvm: true,
    ventilated_seats: false,
    electrically_adjustable_driver_seat: false,
    second_row_ventilated_seat: false,
    steering_wheel_gearshift_paddles: false,
    outside_temperature_display: true,
    glove_box_cooling: false,
    find_my_car_location: false,
    lane_change_indicator: false,
    rear_curtain: false,
    real_time_vehicle_tracking: false,
    remote_fuel_lid_opener: true,
    window_blind: false,
    active_noise_cancellation: false,
    luggage_hook_and_net: false,
    air_suspension: false,
    sunroof: CAR_ENUMS.sunroof[0],
    custom: [],
  },
  entertainment: {
    touchscreen_infotainment_system: true,
    touchscreen: true,
    gps_navigation_system: false,
    bluetooth: true,
    bluetooth_compatibility_connectivity: true,
    usb_compatibility_connectivity: true,
    am_fm_radio: true,
    integrated_in_dash_music_system: true,
    android_auto: true,
    apple_carplay: true,
    aux_compatibility_connectivity: true,
    dvd_player: false,
    ipod_compatibility: false,
    internal_storage_hard_drive: false,
    number_of_speakers: 4,
    speakers: 4,
    custom: [],
  },
  interior: {
    rear_passenger_seat_type: CAR_ENUMS.seat_type[2],
    front_seat_pockets: true,
    door_pockets: true,
    seat_upholstery_type: CAR_ENUMS.upholstery[2],
    digital_tripmeter: true,
    interior_colours: ['Black'],
    upholstery: CAR_ENUMS.upholstery[2],
    headrests: true,
    interior_door_handles: true,
    digital_cockpit: false,
    leather_wrapped_gear_knob_shift_selector: false,
    leather_wrapped_steering_wheel: false,
    digital_tachometer: true,
    digital_odometer: true,
    digital_instrument_cluster: true,
    adjustable_headrests: true,
    ambient_lighting: false,
    custom: [],
  },
  exterior: {
    sunroof: false,
    fog_lamps: true,
    led_headlamps: false,
    roof_rails: false,
    rear_wiper: false,
    rear_defogger: true,
    outside_rear_view_mirrors_orvms: true,
    rear_power_window: true,
    turn_indicators_on_orvm: true,
    tail_lamps_leds: false,
    chrome_exhaust: false,
    chrome_front_grille: false,
    integrated_antenna: true,
    tinted_window_glass: false,
    rain_sensing_wipers: false,
    removable_convertible_top: false,
    dual_tone_body_colors: false,
    roof_carrier: false,
    side_stepper: false,
    xenon_hid_headlamps: false,
    rear_spoiler: false,
    electronic_spoiler: false,
    custom: [],
  },
});

const buildFeatures = (form) => {
  const defaults = getDefaultFeatures();

  return {
    ...defaults,
    safety: {
      ...defaults.safety,
      abs: form.features_abs,
      airbags: form.features_airbags,
      airbag_count: toNumber(form.features_airbag_count, 2),
      safety_rating: toNumber(form.features_safety_rating, 4),
      safety_rating_type: form.features_safety_rating_type,
      rear_camera: form.features_rear_camera,
      parking_sensors: form.features_parking_sensors,
      traction_control: form.features_traction_control,
      hill_assist: form.features_hill_assist,
    },
    comfort: {
      ...defaults.comfort,
      climate_control: form.features_climate_control,
      rear_ac: form.features_rear_ac,
      power_steering: form.features_power_steering,
      power_windows: form.features_power_windows,
      keyless_entry: form.features_keyless_entry,
      cruise_control: form.features_cruise_control,
      sunroof: form.features_sunroof,
    },
    entertainment: {
      ...defaults.entertainment,
      touchscreen: form.features_touchscreen,
      bluetooth: form.features_bluetooth,
      android_auto: form.features_android_auto,
      apple_carplay: form.features_apple_carplay,
      speakers: toNumber(form.features_speakers, 4),
      number_of_speakers: toNumber(form.features_speakers, 4),
    },
    interior: {
      ...defaults.interior,
      rear_passenger_seat_type: form.features_rear_passenger_seat_type,
      seat_upholstery_type: form.features_seat_upholstery_type,
      upholstery: form.features_upholstery,
      interior_colours: splitCsv(form.features_interior_colours),
      adjustable_headrests: form.features_adjustable_headrests,
      ambient_lighting: form.features_ambient_lighting,
    },
    exterior: {
      ...defaults.exterior,
      fog_lamps: form.features_fog_lamps,
      led_headlamps: form.features_led_headlamps,
      roof_rails: form.features_roof_rails,
      rear_wiper: form.features_rear_wiper,
      rear_defogger: form.features_rear_defogger,
    },
  };
};

export const buildCreateCarPayload = (form) => ({
  status: form.status,
  visibility: form.visibility,
  title: form.title,
  brand: form.brand,
  model: form.model,
  variant: form.variant,
  fuel_type: form.fuel_type,
  transmission: form.transmission,
  body_type: form.body_type,
  make_year: toNumber(form.make_year),
  registration_year: toNumber(form.registration_year),
  ownership: form.ownership,
  rto_code: form.rto_code,
  state: form.state,
  kms_driven: toNumber(form.kms_driven),
  insurance_valid_till: form.insurance_valid_till,
  insurance_type: form.insurance_type,
  city: form.city,
  area: form.area,
  delivery_available: form.delivery_available,
  test_drive_available: form.test_drive_available,
  reasons_to_buy: splitCsv(form.reasons_to_buy),
  highlights: splitCsv(form.highlights),
  overall_score: toNumber(form.overall_score, 0),
  dimensions_capacity: {
    ground_clearance_mm: toNumber(form.ground_clearance_mm),
    boot_space_litres: toNumber(form.boot_space_litres),
    seating_rows: toNumber(form.seating_rows),
    seating_capacity: toNumber(form.seating_capacity),
    wheelbase_mm: toNumber(form.wheelbase_mm),
    length_mm: toNumber(form.length_mm),
    width_mm: toNumber(form.width_mm),
    height_mm: toNumber(form.height_mm),
    kerb_weight_kgs: toNumber(form.kerb_weight_kgs),
    maximum_tread_depth_mm: toNumber(form.maximum_tread_depth_mm),
    number_of_doors: toNumber(form.number_of_doors),
    front_tyre_size: form.front_tyre_size,
    rear_tyre_size: form.rear_tyre_size,
    alloy_wheels: form.alloy_wheels,
    wheel_cover: form.wheel_cover,
    custom: [],
  },
  engine_transmission: {
    drivetrain: form.drivetrain,
    gearbox: form.gearbox,
    number_of_gears: toNumber(form.number_of_gears),
    automatic_transmission_type: form.automatic_transmission_type,
    displacement_cc: toNumber(form.displacement_cc),
    number_of_cylinders: toNumber(form.number_of_cylinders),
    valves_per_cylinder: toNumber(form.valves_per_cylinder),
    turbocharger: form.turbocharger,
    mild_hybrid: form.mild_hybrid,
    custom: [],
  },
  fuel_performance: {
    mileage_arai_kmpl: toNumber(form.mileage_arai_kmpl),
    max_power: form.max_power,
    max_torque: form.max_torque,
  },
  suspension_steering_brakes: {
    suspension_front_type: form.suspension_front_type,
    suspension_front: form.suspension_front,
    suspension_rear_type: form.suspension_rear_type,
    suspension_rear: form.suspension_rear,
    steering_type: form.steering_type,
    steering_adjustment: form.steering_adjustment,
    front_brake_type: form.front_brake_type,
    rear_brake_type: form.rear_brake_type,
    brakes: form.brakes,
  },
  booking_policy: {
    booking_enabled: form.booking_enabled,
    cta_text: form.cta_text,
    refund_policy: form.refund_policy,
    refund_condition: form.refund_condition,
  },
  features: buildFeatures(form),
  tyres: {
    front: {
      brand: form.tyre_brand,
      size: form.front_tyre_size,
      condition: form.tyre_condition,
      tread_mm: toNumber(form.front_tread_mm),
    },
    rear: {
      brand: form.tyre_brand,
      size: form.rear_tyre_size,
      condition: form.tyre_condition,
      tread_mm: toNumber(form.rear_tread_mm),
    },
    spare: {
      brand: form.tyre_brand,
      size: form.spare_tyre_size,
      condition: form.tyre_condition,
      tread_mm: toNumber(form.spare_tread_mm),
    },
  },
  media: {
    images: [
      {
        url: form.primary_image_url,
        view_type: form.media_view_type || 'gallery',
        gallery_category: form.media_gallery_category || 'other',
        kind: form.media_kind || form.media_gallery_category || 'other',
        sort_order: toNumber(form.media_sort_order, 1),
      },
    ],
    inspection_report: {
      url: form.inspection_report_url,
      type: form.inspection_report_type || 'pdf',
    },
  },
  price: {
    amount: toNumber(form.price_amount),
    currency: form.price_currency,
  },
  custom: [],
});

export const defaultCreateCarForm = {
  status: '',
  visibility: '',
  title: '',
  brand: '',
  model: '',
  variant: '',
  fuel_type: '',
  transmission: '',
  body_type: '',
  make_year: '',
  registration_year: '',
  ownership: '',
  rto_code: '',
  state: '',
  city: '',
  area: '',
  kms_driven: '',
  insurance_valid_till: '',
  insurance_type: '',
  overall_score: '',
  reasons_to_buy: '',
  highlights: '',
  delivery_available: false,
  test_drive_available: false,
  price_amount: '',
  price_currency: '',

  ground_clearance_mm: '',
  boot_space_litres: '',
  seating_rows: '',
  seating_capacity: '',
  wheelbase_mm: '',
  length_mm: '',
  width_mm: '',
  height_mm: '',
  kerb_weight_kgs: '',
  maximum_tread_depth_mm: '',
  number_of_doors: '',
  alloy_wheels: false,
  wheel_cover: false,

  drivetrain: '',
  gearbox: '',
  number_of_gears: '',
  automatic_transmission_type: '',
  displacement_cc: '',
  number_of_cylinders: '',
  valves_per_cylinder: '',
  turbocharger: false,
  mild_hybrid: false,

  mileage_arai_kmpl: '',
  max_power: '',
  max_torque: '',

  suspension_front_type: '',
  suspension_front: '',
  suspension_rear_type: '',
  suspension_rear: '',
  steering_type: '',
  steering_adjustment: '',
  front_brake_type: '',
  rear_brake_type: '',
  brakes: '',

  booking_enabled: false,
  cta_text: '',
  refund_policy: '',
  refund_condition: '',

  tyre_brand: '',
  tyre_condition: '',
  front_tyre_size: '',
  rear_tyre_size: '',
  spare_tyre_size: '',
  front_tread_mm: '',
  rear_tread_mm: '',
  spare_tread_mm: '',

  primary_image_url: '',
  media_view_type: '',
  media_gallery_category: '',
  media_kind: '',
  media_sort_order: '',
  inspection_report_url: '',
  inspection_report_type: '',

  features_abs: false,
  features_airbags: '',
  features_airbag_count: '',
  features_safety_rating: '',
  features_safety_rating_type: '',
  features_rear_camera: false,
  features_parking_sensors: '',
  features_traction_control: false,
  features_hill_assist: false,

  features_climate_control: false,
  features_rear_ac: false,
  features_power_steering: false,
  features_power_windows: '',
  features_keyless_entry: false,
  features_cruise_control: false,
  features_sunroof: '',

  features_touchscreen: false,
  features_bluetooth: false,
  features_android_auto: false,
  features_apple_carplay: false,
  features_speakers: '',

  features_rear_passenger_seat_type: '',
  features_seat_upholstery_type: '',
  features_upholstery: '',
  features_interior_colours: '',
  features_adjustable_headrests: false,
  features_ambient_lighting: false,

  features_fog_lamps: false,
  features_led_headlamps: false,
  features_roof_rails: false,
  features_rear_wiper: false,
  features_rear_defogger: false,
};

const toInputDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const toCsv = (value) => (Array.isArray(value) ? value.join(', ') : '');

const bool = (value) => Boolean(value);

export const mapCarToForm = (car) => {
  if (!car) return { ...defaultCreateCarForm };

  return {
    ...defaultCreateCarForm,
    status: car.status || '',
    visibility: car.visibility || '',
    title: car.title || '',
    brand: car.brand || '',
    model: car.model || '',
    variant: car.variant || '',
    fuel_type: car.fuel_type || '',
    transmission: car.transmission || '',
    body_type: car.body_type || '',
    make_year: car.make_year ? String(car.make_year) : '',
    registration_year: car.registration_year ? String(car.registration_year) : '',
    ownership: car.ownership || '',
    rto_code: car.rto_code || '',
    state: car.state || '',
    city: car.city || '',
    area: car.area || '',
    kms_driven: car.kms_driven ? String(car.kms_driven) : '',
    insurance_valid_till: toInputDate(car.insurance_valid_till),
    insurance_type: car.insurance_type || '',
    overall_score: car.overall_score !== undefined ? String(car.overall_score) : '',
    reasons_to_buy: toCsv(car.reasons_to_buy),
    highlights: toCsv(car.highlights),
    delivery_available: bool(car.delivery_available),
    test_drive_available: bool(car.test_drive_available),
    price_amount: car.price?.amount !== undefined ? String(car.price.amount) : '',
    price_currency: car.price?.currency || '',

    ground_clearance_mm:
      car.dimensions_capacity?.ground_clearance_mm !== undefined
        ? String(car.dimensions_capacity.ground_clearance_mm)
        : '',
    boot_space_litres:
      car.dimensions_capacity?.boot_space_litres !== undefined
        ? String(car.dimensions_capacity.boot_space_litres)
        : '',
    seating_rows:
      car.dimensions_capacity?.seating_rows !== undefined
        ? String(car.dimensions_capacity.seating_rows)
        : '',
    seating_capacity:
      car.dimensions_capacity?.seating_capacity !== undefined
        ? String(car.dimensions_capacity.seating_capacity)
        : '',
    wheelbase_mm:
      car.dimensions_capacity?.wheelbase_mm !== undefined
        ? String(car.dimensions_capacity.wheelbase_mm)
        : '',
    length_mm:
      car.dimensions_capacity?.length_mm !== undefined ? String(car.dimensions_capacity.length_mm) : '',
    width_mm:
      car.dimensions_capacity?.width_mm !== undefined ? String(car.dimensions_capacity.width_mm) : '',
    height_mm:
      car.dimensions_capacity?.height_mm !== undefined ? String(car.dimensions_capacity.height_mm) : '',
    kerb_weight_kgs:
      car.dimensions_capacity?.kerb_weight_kgs !== undefined
        ? String(car.dimensions_capacity.kerb_weight_kgs)
        : '',
    maximum_tread_depth_mm:
      car.dimensions_capacity?.maximum_tread_depth_mm !== undefined
        ? String(car.dimensions_capacity.maximum_tread_depth_mm)
        : '',
    number_of_doors:
      car.dimensions_capacity?.number_of_doors !== undefined
        ? String(car.dimensions_capacity.number_of_doors)
        : '',
    alloy_wheels: bool(car.dimensions_capacity?.alloy_wheels),
    wheel_cover: bool(car.dimensions_capacity?.wheel_cover),

    drivetrain: car.engine_transmission?.drivetrain || '',
    gearbox: car.engine_transmission?.gearbox || '',
    number_of_gears:
      car.engine_transmission?.number_of_gears !== undefined
        ? String(car.engine_transmission.number_of_gears)
        : '',
    automatic_transmission_type: car.engine_transmission?.automatic_transmission_type || '',
    displacement_cc:
      car.engine_transmission?.displacement_cc !== undefined
        ? String(car.engine_transmission.displacement_cc)
        : '',
    number_of_cylinders:
      car.engine_transmission?.number_of_cylinders !== undefined
        ? String(car.engine_transmission.number_of_cylinders)
        : '',
    valves_per_cylinder:
      car.engine_transmission?.valves_per_cylinder !== undefined
        ? String(car.engine_transmission.valves_per_cylinder)
        : '',
    turbocharger: bool(car.engine_transmission?.turbocharger),
    mild_hybrid: bool(car.engine_transmission?.mild_hybrid),

    mileage_arai_kmpl:
      car.fuel_performance?.mileage_arai_kmpl !== undefined
        ? String(car.fuel_performance.mileage_arai_kmpl)
        : '',
    max_power: car.fuel_performance?.max_power || '',
    max_torque: car.fuel_performance?.max_torque || '',

    suspension_front_type: car.suspension_steering_brakes?.suspension_front_type || '',
    suspension_front: car.suspension_steering_brakes?.suspension_front || '',
    suspension_rear_type: car.suspension_steering_brakes?.suspension_rear_type || '',
    suspension_rear: car.suspension_steering_brakes?.suspension_rear || '',
    steering_type: car.suspension_steering_brakes?.steering_type || '',
    steering_adjustment: car.suspension_steering_brakes?.steering_adjustment || '',
    front_brake_type: car.suspension_steering_brakes?.front_brake_type || '',
    rear_brake_type: car.suspension_steering_brakes?.rear_brake_type || '',
    brakes: car.suspension_steering_brakes?.brakes || '',

    booking_enabled: bool(car.booking_policy?.booking_enabled),
    cta_text: car.booking_policy?.cta_text || '',
    refund_policy: car.booking_policy?.refund_policy || '',
    refund_condition: car.booking_policy?.refund_condition || '',

    tyre_brand: car.tyres?.front?.brand || '',
    tyre_condition: car.tyres?.front?.condition || '',
    front_tyre_size: car.tyres?.front?.size || car.dimensions_capacity?.front_tyre_size || '',
    rear_tyre_size: car.tyres?.rear?.size || car.dimensions_capacity?.rear_tyre_size || '',
    spare_tyre_size: car.tyres?.spare?.size || '',
    front_tread_mm: car.tyres?.front?.tread_mm !== undefined ? String(car.tyres.front.tread_mm) : '',
    rear_tread_mm: car.tyres?.rear?.tread_mm !== undefined ? String(car.tyres.rear.tread_mm) : '',
    spare_tread_mm: car.tyres?.spare?.tread_mm !== undefined ? String(car.tyres.spare.tread_mm) : '',

    primary_image_url: car.media?.images?.[0]?.url || '',
    media_view_type: car.media?.images?.[0]?.view_type || '',
    media_gallery_category: car.media?.images?.[0]?.gallery_category || '',
    media_kind: car.media?.images?.[0]?.kind || '',
    media_sort_order:
      car.media?.images?.[0]?.sort_order !== undefined ? String(car.media.images[0].sort_order) : '',
    inspection_report_url: car.media?.inspection_report?.url || '',
    inspection_report_type: car.media?.inspection_report?.type || '',

    features_abs: bool(car.features?.safety?.abs),
    features_airbags: car.features?.safety?.airbags || '',
    features_airbag_count:
      car.features?.safety?.airbag_count !== undefined ? String(car.features.safety.airbag_count) : '',
    features_safety_rating:
      car.features?.safety?.safety_rating !== undefined ? String(car.features.safety.safety_rating) : '',
    features_safety_rating_type: car.features?.safety?.safety_rating_type || '',
    features_rear_camera: bool(car.features?.safety?.rear_camera),
    features_parking_sensors: car.features?.safety?.parking_sensors || '',
    features_traction_control: bool(car.features?.safety?.traction_control),
    features_hill_assist: bool(car.features?.safety?.hill_assist),

    features_climate_control: bool(car.features?.comfort?.climate_control),
    features_rear_ac: bool(car.features?.comfort?.rear_ac),
    features_power_steering: bool(car.features?.comfort?.power_steering),
    features_power_windows: car.features?.comfort?.power_windows || '',
    features_keyless_entry: bool(car.features?.comfort?.keyless_entry),
    features_cruise_control: bool(car.features?.comfort?.cruise_control),
    features_sunroof: car.features?.comfort?.sunroof || '',

    features_touchscreen: bool(car.features?.entertainment?.touchscreen),
    features_bluetooth: bool(car.features?.entertainment?.bluetooth),
    features_android_auto: bool(car.features?.entertainment?.android_auto),
    features_apple_carplay: bool(car.features?.entertainment?.apple_carplay),
    features_speakers:
      car.features?.entertainment?.speakers !== undefined
        ? String(car.features.entertainment.speakers)
        : '',

    features_rear_passenger_seat_type: car.features?.interior?.rear_passenger_seat_type || '',
    features_seat_upholstery_type: car.features?.interior?.seat_upholstery_type || '',
    features_upholstery: car.features?.interior?.upholstery || '',
    features_interior_colours: toCsv(car.features?.interior?.interior_colours),
    features_adjustable_headrests: bool(car.features?.interior?.adjustable_headrests),
    features_ambient_lighting: bool(car.features?.interior?.ambient_lighting),

    features_fog_lamps: bool(car.features?.exterior?.fog_lamps),
    features_led_headlamps: bool(car.features?.exterior?.led_headlamps),
    features_roof_rails: bool(car.features?.exterior?.roof_rails),
    features_rear_wiper: bool(car.features?.exterior?.rear_wiper),
    features_rear_defogger: bool(car.features?.exterior?.rear_defogger),
  };
};

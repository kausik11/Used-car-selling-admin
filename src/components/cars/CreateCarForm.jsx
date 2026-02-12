import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { CAR_ENUMS, toOptions } from '../../constants/carEnums';
import CheckboxField from '../common/CheckboxField';
import FormSection from '../common/FormSection';
import SelectField from '../common/SelectField';
import TextField from '../common/TextField';
import { buildCreateCarPayload, defaultCreateCarForm, mapCarToForm } from './buildCreateCarPayload';

const createMediaItem = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  file: null,
  existingUrl: '',
  view_type: '',
  gallery_category: '',
  kind: '',
});

const mediaItemsFromCar = (car) => {
  const images = Array.isArray(car?.media?.images) ? car.media.images : [];
  if (images.length === 0) return [createMediaItem()];
  return images.map((image, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    file: null,
    existingUrl: image?.url || '',
    view_type: image?.view_type || '',
    gallery_category: image?.gallery_category || '',
    kind: image?.kind || '',
  }));
};

function CreateCarForm({ compact = false, onSuccess, onCancel, mode = 'create', carId, initialData }) {
  const [form, setForm] = useState(defaultCreateCarForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mediaItems, setMediaItems] = useState([createMediaItem()]);
  const [reportFile, setReportFile] = useState(null);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (isEditMode && initialData) {
      setForm(mapCarToForm(initialData));
      setMediaItems(mediaItemsFromCar(initialData));
      setReportFile(null);
      return;
    }

    setForm(defaultCreateCarForm);
    setMediaItems([createMediaItem()]);
    setReportFile(null);
  }, [isEditMode, initialData]);

  const payloadPreview = useMemo(() => {
    const payload = buildCreateCarPayload(form);
    const imageUploads = mediaItems.filter((item) => item.file);

    if (imageUploads.length > 0 || reportFile) {
      payload.media = {
        images:
          imageUploads.length > 0
            ? imageUploads.map((item, index) => ({
                url: item.existingUrl || `[file] ${item.file.name}`,
                view_type: item.view_type || 'gallery',
                gallery_category: item.gallery_category || 'other',
                kind: (item.view_type || 'gallery') === 'gallery' ? item.kind || item.gallery_category || 'other' : undefined,
                sort_order: index + 1,
              }))
            : payload.media.images,
        inspection_report: reportFile
          ? { url: `[file] ${reportFile.name}`, type: form.inspection_report_type || 'pdf' }
          : payload.media.inspection_report,
      };
    }

    return payload;
  }, [form, mediaItems, reportFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleToggle = (event) => {
    const { name, checked } = event.target;
    setForm((current) => ({ ...current, [name]: checked }));
  };

  const updateMediaItem = (id, key, value) => {
    setMediaItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [key]: value };
      }),
    );
  };

  const addMediaItem = () => {
    setMediaItems((current) => [...current, createMediaItem()]);
  };

  const removeMediaItem = (id) => {
    setMediaItems((current) => {
      if (current.length === 1) return current;
      return current.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setResponseData(null);

    try {
      const payload = buildCreateCarPayload(form);
      const imageUploads = mediaItems.filter((item) => item.file);
      const hasFileUploads = imageUploads.length > 0 || Boolean(reportFile);
      const hasMediaUrls = Boolean(form.primary_image_url && form.inspection_report_url);

      if (!hasFileUploads && !hasMediaUrls) {
        throw new Error('Provide media URLs or upload files in Media section.');
      }

      if (hasFileUploads) {
        payload.media = {
          images: [
            {
              url:
                form.primary_image_url ||
                'https://dummyimage.com/1200x800/cccccc/111111.jpg&text=media+upload+pending',
              view_type: 'gallery',
              gallery_category: 'other',
              kind: 'other',
              sort_order: 1,
            },
          ],
          inspection_report: {
            url:
              form.inspection_report_url ||
              'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: form.inspection_report_type || 'pdf',
          },
        };
      }

      let primaryResponse;
      let targetCarId = carId || initialData?.car_id;

      if (isEditMode) {
        if (!targetCarId) throw new Error('Missing car_id for edit request.');
        primaryResponse = await api.patch(`/cars/${targetCarId}`, payload);
      } else {
        primaryResponse = await api.post('/cars', payload);
        targetCarId = primaryResponse.data?.car_id;
      }

      let mediaUploadResponse = null;
      if (targetCarId && hasFileUploads) {
        const mediaFormData = new FormData();

        imageUploads.forEach((item, index) => {
          mediaFormData.append('images', item.file);
          mediaFormData.append(`images_view_type_${index}`, item.view_type || 'gallery');
          mediaFormData.append(
            `images_gallery_category_${index}`,
            item.gallery_category || item.kind || 'other',
          );
          if ((item.view_type || 'gallery') === 'gallery') {
            mediaFormData.append(`images_kind_${index}`, item.kind || item.gallery_category || 'other');
          }
        });

        if (reportFile) {
          mediaFormData.append('inspection_report', reportFile);
        }

        mediaUploadResponse = await api.post(`/cars/${targetCarId}/media`, mediaFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const finalResponse = {
        [isEditMode ? 'updated_car' : 'created_car']: primaryResponse.data,
        media_upload: mediaUploadResponse?.data || null,
      };

      setResponseData(finalResponse);
      if (onSuccess) onSuccess(finalResponse);
    } catch (error) {
      const apiError = error.response?.data;
      setErrorMessage(
        typeof apiError === 'string' ? apiError : JSON.stringify(apiError || { error: error.message }, null, 2),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (isEditMode && initialData) {
      setForm(mapCarToForm(initialData));
      setMediaItems(mediaItemsFromCar(initialData));
    } else {
      setForm(defaultCreateCarForm);
      setMediaItems([createMediaItem()]);
    }
    setReportFile(null);
    setErrorMessage('');
    setResponseData(null);
  };

  return (
    <div className="space-y-5">
      {!compact ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">{isEditMode ? 'Edit Car' : 'Create Car'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Expanded form with fields from CarListing, Dimensions, EngineTransmission, FuelPerformance,
            SuspensionSteeringBrakes, BookingPolicy, Tyres, Media and Features.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSection title="Car Listing" subtitle="Primary listing fields">
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} required />
          <TextField label="Brand" name="brand" value={form.brand} onChange={handleChange} required />
          <TextField label="Model" name="model" value={form.model} onChange={handleChange} required />
          <TextField label="Variant" name="variant" value={form.variant} onChange={handleChange} required />
          <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={toOptions(CAR_ENUMS.status)} required />
          <SelectField
            label="Visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.visibility)}
            required
          />
          <SelectField
            label="Fuel Type"
            name="fuel_type"
            value={form.fuel_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.fuel_type)}
            required
          />
          <SelectField
            label="Transmission"
            name="transmission"
            value={form.transmission}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.transmission)}
            required
          />
          <SelectField
            label="Body Type"
            name="body_type"
            value={form.body_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.body_type)}
            required
          />
          <SelectField
            label="Ownership"
            name="ownership"
            value={form.ownership}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.ownership)}
            required
          />
          <TextField label="Make Year" name="make_year" type="number" value={form.make_year} onChange={handleChange} required />
          <TextField
            label="Registration Year"
            name="registration_year"
            type="number"
            value={form.registration_year}
            onChange={handleChange}
            required
          />
        </FormSection>

        <FormSection title="Location and Price" subtitle="Region, insurance and price">
          <TextField label="RTO Code" name="rto_code" value={form.rto_code} onChange={handleChange} required />
          <TextField label="State" name="state" value={form.state} onChange={handleChange} required />
          <TextField label="City" name="city" value={form.city} onChange={handleChange} required />
          <TextField label="Area" name="area" value={form.area} onChange={handleChange} required />
          <TextField label="KMs Driven" name="kms_driven" type="number" value={form.kms_driven} onChange={handleChange} required />
          <TextField
            label="Insurance Valid Till"
            name="insurance_valid_till"
            type="date"
            value={form.insurance_valid_till}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Insurance Type"
            name="insurance_type"
            value={form.insurance_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.insurance_type)}
            required
          />
          <TextField label="Overall Score" name="overall_score" type="number" value={form.overall_score} onChange={handleChange} required />
          <TextField label="Price Amount" name="price_amount" type="number" value={form.price_amount} onChange={handleChange} required />
          <TextField label="Price Currency" name="price_currency" value={form.price_currency} onChange={handleChange} required />
          <TextField
            label="Reasons To Buy (comma separated)"
            name="reasons_to_buy"
            value={form.reasons_to_buy}
            onChange={handleChange}
            required
          />
          <TextField
            label="Highlights (comma separated)"
            name="highlights"
            value={form.highlights}
            onChange={handleChange}
            required
          />
          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
            <CheckboxField
              label="Delivery Available"
              name="delivery_available"
              checked={form.delivery_available}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Test Drive Available"
              name="test_drive_available"
              checked={form.test_drive_available}
              onChange={handleToggle}
            />
          </div>
        </FormSection>

        <FormSection title="Dimensions Capacity" subtitle="DimensionsCapacity model fields">
          <TextField label="Ground Clearance (mm)" name="ground_clearance_mm" type="number" value={form.ground_clearance_mm} onChange={handleChange} required />
          <TextField label="Boot Space (litres)" name="boot_space_litres" type="number" value={form.boot_space_litres} onChange={handleChange} required />
          <TextField label="Seating Rows" name="seating_rows" type="number" value={form.seating_rows} onChange={handleChange} required />
          <TextField
            label="Seating Capacity"
            name="seating_capacity"
            type="number"
            value={form.seating_capacity}
            onChange={handleChange}
            required
          />
          <TextField label="Wheelbase (mm)" name="wheelbase_mm" type="number" value={form.wheelbase_mm} onChange={handleChange} required />
          <TextField label="Length (mm)" name="length_mm" type="number" value={form.length_mm} onChange={handleChange} required />
          <TextField label="Width (mm)" name="width_mm" type="number" value={form.width_mm} onChange={handleChange} required />
          <TextField label="Height (mm)" name="height_mm" type="number" value={form.height_mm} onChange={handleChange} required />
          <TextField label="Kerb Weight (kgs)" name="kerb_weight_kgs" type="number" value={form.kerb_weight_kgs} onChange={handleChange} required />
          <TextField
            label="Max Tread Depth (mm)"
            name="maximum_tread_depth_mm"
            type="number"
            value={form.maximum_tread_depth_mm}
            onChange={handleChange}
            required
          />
          <TextField label="Number of Doors" name="number_of_doors" type="number" value={form.number_of_doors} onChange={handleChange} required />
          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
            <CheckboxField label="Alloy Wheels" name="alloy_wheels" checked={form.alloy_wheels} onChange={handleToggle} />
            <CheckboxField label="Wheel Cover" name="wheel_cover" checked={form.wheel_cover} onChange={handleToggle} />
          </div>
        </FormSection>

        <FormSection title="Engine and Fuel" subtitle="EngineTransmission and FuelPerformance fields">
          <SelectField
            label="Drivetrain"
            name="drivetrain"
            value={form.drivetrain}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.drivetrain)}
            required
          />
          <TextField label="Gearbox" name="gearbox" value={form.gearbox} onChange={handleChange} required />
          <TextField label="Number of Gears" name="number_of_gears" type="number" value={form.number_of_gears} onChange={handleChange} required />
          <TextField
            label="Auto Transmission Type"
            name="automatic_transmission_type"
            value={form.automatic_transmission_type}
            onChange={handleChange}
            required
          />
          <TextField label="Displacement (cc)" name="displacement_cc" type="number" value={form.displacement_cc} onChange={handleChange} required />
          <TextField
            label="Number of Cylinders"
            name="number_of_cylinders"
            type="number"
            value={form.number_of_cylinders}
            onChange={handleChange}
            required
          />
          <TextField
            label="Valves Per Cylinder"
            name="valves_per_cylinder"
            type="number"
            value={form.valves_per_cylinder}
            onChange={handleChange}
            required
          />
          <TextField label="Mileage ARAI (kmpl)" name="mileage_arai_kmpl" type="number" value={form.mileage_arai_kmpl} onChange={handleChange} required />
          <TextField label="Max Power" name="max_power" value={form.max_power} onChange={handleChange} required />
          <TextField label="Max Torque" name="max_torque" value={form.max_torque} onChange={handleChange} required />
          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
            <CheckboxField label="Turbocharger" name="turbocharger" checked={form.turbocharger} onChange={handleToggle} />
            <CheckboxField label="Mild Hybrid" name="mild_hybrid" checked={form.mild_hybrid} onChange={handleToggle} />
          </div>
        </FormSection>

        <FormSection title="Suspension and Booking" subtitle="SuspensionSteeringBrakes and BookingPolicy fields">
          <TextField
            label="Suspension Front Type"
            name="suspension_front_type"
            value={form.suspension_front_type}
            onChange={handleChange}
            required
          />
          <TextField
            label="Suspension Front"
            name="suspension_front"
            value={form.suspension_front}
            onChange={handleChange}
            required
          />
          <TextField
            label="Suspension Rear Type"
            name="suspension_rear_type"
            value={form.suspension_rear_type}
            onChange={handleChange}
            required
          />
          <TextField label="Suspension Rear" name="suspension_rear" value={form.suspension_rear} onChange={handleChange} required />
          <TextField label="Steering Type" name="steering_type" value={form.steering_type} onChange={handleChange} required />
          <TextField
            label="Steering Adjustment"
            name="steering_adjustment"
            value={form.steering_adjustment}
            onChange={handleChange}
            required
          />
          <TextField label="Front Brake Type" name="front_brake_type" value={form.front_brake_type} onChange={handleChange} required />
          <TextField label="Rear Brake Type" name="rear_brake_type" value={form.rear_brake_type} onChange={handleChange} required />
          <TextField label="Brakes" name="brakes" value={form.brakes} onChange={handleChange} required />
          <TextField label="CTA Text" name="cta_text" value={form.cta_text} onChange={handleChange} required />
          <TextField label="Refund Policy" name="refund_policy" value={form.refund_policy} onChange={handleChange} required />
          <TextField
            label="Refund Condition"
            name="refund_condition"
            value={form.refund_condition}
            onChange={handleChange}
            required
          />
          <div className="md:col-span-2">
            <CheckboxField
              label="Booking Enabled"
              name="booking_enabled"
              checked={form.booking_enabled}
              onChange={handleToggle}
            />
          </div>
        </FormSection>

        <FormSection title="Tyres and Media" subtitle="Tyres and Media model fields">
          <TextField label="Tyre Brand" name="tyre_brand" value={form.tyre_brand} onChange={handleChange} required />
          <SelectField
            label="Tyre Condition"
            name="tyre_condition"
            value={form.tyre_condition}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.tyre_condition)}
            required
          />
          <TextField label="Front Tyre Size" name="front_tyre_size" value={form.front_tyre_size} onChange={handleChange} required />
          <TextField label="Rear Tyre Size" name="rear_tyre_size" value={form.rear_tyre_size} onChange={handleChange} required />
          <TextField label="Spare Tyre Size" name="spare_tyre_size" value={form.spare_tyre_size} onChange={handleChange} required />
          <TextField label="Front Tread (mm)" name="front_tread_mm" type="number" value={form.front_tread_mm} onChange={handleChange} required />
          <TextField label="Rear Tread (mm)" name="rear_tread_mm" type="number" value={form.rear_tread_mm} onChange={handleChange} required />
          <TextField label="Spare Tread (mm)" name="spare_tread_mm" type="number" value={form.spare_tread_mm} onChange={handleChange} required />
          <TextField
            label="Fallback Primary Image URL (used if files are uploaded)"
            name="primary_image_url"
            value={form.primary_image_url}
            onChange={handleChange}
            placeholder="https://..."
          />
          <TextField
            label="Fallback Inspection Report URL (used if files are uploaded)"
            name="inspection_report_url"
            value={form.inspection_report_url}
            onChange={handleChange}
            placeholder="https://..."
          />
          <SelectField
            label="Inspection Report Type"
            name="inspection_report_type"
            value={form.inspection_report_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.media_report_type)}
            required
          />
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">Attach Inspection Report File</p>
            <p className="mb-2 text-xs text-slate-500">
              Optional. If selected, file upload uses `/cars/:car_id/media` after creating the car.
            </p>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => setReportFile(event.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            {reportFile ? <p className="mt-2 text-xs text-slate-600">Selected: {reportFile.name}</p> : null}
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Attach Multiple Images</p>
                <p className="text-xs text-slate-500">
                  Add different categories per image. Supports gallery/exterior/interior/engine/tyres/etc.
                </p>
              </div>
              <button
                type="button"
                onClick={addMediaItem}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                + Add Image
              </button>
            </div>

            <div className="space-y-3">
              {mediaItems.map((item, index) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Image #{index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeMediaItem(item.id)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          updateMediaItem(item.id, 'file', event.target.files?.[0] || null)
                        }
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">View Type</span>
                      <select
                        value={item.view_type}
                        onChange={(event) => updateMediaItem(item.id, 'view_type', event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select view type</option>
                        {toOptions(CAR_ENUMS.media_view_type).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">Gallery Category</span>
                      <select
                        value={item.gallery_category}
                        onChange={(event) => updateMediaItem(item.id, 'gallery_category', event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select category</option>
                        {toOptions(CAR_ENUMS.media_gallery_category).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">Kind (for gallery)</span>
                      <select
                        value={item.kind}
                        onChange={(event) => updateMediaItem(item.id, 'kind', event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select kind</option>
                        {toOptions(CAR_ENUMS.media_gallery_category).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {item.file ? (
                    <p className="mt-2 text-xs text-slate-600">Selected file: {item.file.name}</p>
                  ) : item.existingUrl ? (
                    <p className="mt-2 text-xs text-slate-600">Current image: {item.existingUrl}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Feature Controls" subtitle="Key fields from CarFeatures model">
          <SelectField
            label="Airbags"
            name="features_airbags"
            value={form.features_airbags}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.airbags)}
            required
          />
          <TextField
            label="Airbag Count"
            name="features_airbag_count"
            type="number"
            value={form.features_airbag_count}
            onChange={handleChange}
            required
          />
          <TextField
            label="Safety Rating"
            name="features_safety_rating"
            type="number"
            value={form.features_safety_rating}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Safety Rating Type"
            name="features_safety_rating_type"
            value={form.features_safety_rating_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.safety_rating_type)}
            required
          />
          <SelectField
            label="Parking Sensors"
            name="features_parking_sensors"
            value={form.features_parking_sensors}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.parking_sensors)}
            required
          />
          <SelectField
            label="Power Windows"
            name="features_power_windows"
            value={form.features_power_windows}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.power_windows)}
            required
          />
          <SelectField
            label="Comfort Sunroof"
            name="features_sunroof"
            value={form.features_sunroof}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.sunroof)}
            required
          />
          <TextField
            label="Speakers"
            name="features_speakers"
            type="number"
            value={form.features_speakers}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Rear Passenger Seat Type"
            name="features_rear_passenger_seat_type"
            value={form.features_rear_passenger_seat_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.seat_type)}
            required
          />
          <SelectField
            label="Seat Upholstery Type"
            name="features_seat_upholstery_type"
            value={form.features_seat_upholstery_type}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.upholstery)}
            required
          />
          <SelectField
            label="Upholstery"
            name="features_upholstery"
            value={form.features_upholstery}
            onChange={handleChange}
            options={toOptions(CAR_ENUMS.upholstery)}
            required
          />
          <TextField
            label="Interior Colours (comma separated)"
            name="features_interior_colours"
            value={form.features_interior_colours}
            onChange={handleChange}
            required
          />

          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CheckboxField label="ABS" name="features_abs" checked={form.features_abs} onChange={handleToggle} />
            <CheckboxField
              label="Rear Camera"
              name="features_rear_camera"
              checked={form.features_rear_camera}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Traction Control"
              name="features_traction_control"
              checked={form.features_traction_control}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Hill Assist"
              name="features_hill_assist"
              checked={form.features_hill_assist}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Climate Control"
              name="features_climate_control"
              checked={form.features_climate_control}
              onChange={handleToggle}
            />
            <CheckboxField label="Rear AC" name="features_rear_ac" checked={form.features_rear_ac} onChange={handleToggle} />
            <CheckboxField
              label="Power Steering"
              name="features_power_steering"
              checked={form.features_power_steering}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Keyless Entry"
              name="features_keyless_entry"
              checked={form.features_keyless_entry}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Cruise Control"
              name="features_cruise_control"
              checked={form.features_cruise_control}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Touchscreen"
              name="features_touchscreen"
              checked={form.features_touchscreen}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Bluetooth"
              name="features_bluetooth"
              checked={form.features_bluetooth}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Android Auto"
              name="features_android_auto"
              checked={form.features_android_auto}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Apple CarPlay"
              name="features_apple_carplay"
              checked={form.features_apple_carplay}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Adjustable Headrests"
              name="features_adjustable_headrests"
              checked={form.features_adjustable_headrests}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Ambient Lighting"
              name="features_ambient_lighting"
              checked={form.features_ambient_lighting}
              onChange={handleToggle}
            />
            <CheckboxField label="Fog Lamps" name="features_fog_lamps" checked={form.features_fog_lamps} onChange={handleToggle} />
            <CheckboxField
              label="LED Headlamps"
              name="features_led_headlamps"
              checked={form.features_led_headlamps}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Roof Rails"
              name="features_roof_rails"
              checked={form.features_roof_rails}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Rear Wiper"
              name="features_rear_wiper"
              checked={form.features_rear_wiper}
              onChange={handleToggle}
            />
            <CheckboxField
              label="Rear Defogger"
              name="features_rear_defogger"
              checked={form.features_rear_defogger}
              onChange={handleToggle}
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Car' : 'Create Car'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Reset
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className={`grid gap-4 ${compact ? 'xl:grid-cols-1' : 'xl:grid-cols-2'}`}>
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-4">
          <h3 className="mb-2 text-sm font-semibold text-cyan-300">Payload Preview</h3>
          <pre className="max-h-96 overflow-auto text-xs text-slate-100">{JSON.stringify(payloadPreview, null, 2)}</pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Server Response</h3>
          {errorMessage ? (
            <pre className="max-h-96 overflow-auto rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{errorMessage}</pre>
          ) : null}
          {responseData ? (
            <pre className="max-h-96 overflow-auto rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-slate-500">Submit the form to create car and view API response.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CreateCarForm;

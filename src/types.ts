export type CabinClass = 'economy' | 'business' | 'first';

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  created_at: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  airline_code: string;
  origin_id: string;
  destination_id: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  base_price: number;
  business_price: number;
  first_price: number;
  total_seats: number;
  available_seats: number;
  aircraft: string;
  created_at: string;
  origin?: Airport;
  destination?: Airport;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  cabin_class: CabinClass;
  passengers: number;
  total_price: number;
  status: BookingStatus;
  booking_reference: string;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  created_at: string;
  flight?: Flight;
}

export const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First Class',
};

export const CABIN_CLASS_SHORT: Record<CabinClass, string> = {
  economy: 'Econ',
  business: 'Biz',
  first: 'First',
};

export const priceForCabin = (flight: Flight, cabin: CabinClass): number => {
  switch (cabin) {
    case 'business':
      return flight.business_price;
    case 'first':
      return flight.first_price;
    default:
      return flight.base_price;
  }
};

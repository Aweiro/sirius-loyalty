export const INITIAL_USERS = [
  {
    id: '1',
    name: 'Олексій Іванченко',
    phone: '+380971234567',
    visits_count: 3,
    last_visit_at: '2026-04-10T15:30:00Z',
    referral_code: 'ALEX123',
    video_stage: 2 // 3-5 visits
  },
  {
    id: '2',
    name: 'Марина Соколовська',
    phone: '+380509876543',
    visits_count: 9,
    last_visit_at: '2026-04-12T11:00:00Z',
    referral_code: 'MARYNA9',
    video_stage: 3 // 6-9 visits
  }
];

export const VIDEO_STAGES = [
  { stage: 1, range: [0, 2], url: 'https://assets.mixkit.co/videos/preview/mixkit-barber-cutting-hair-with-scissors-and-comb-4340-large.mp4' },
  { stage: 2, range: [3, 5], url: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-client-with-a-razor-4343-large.mp4' },
  { stage: 3, range: [6, 9], url: 'https://assets.mixkit.co/videos/preview/mixkit-beard-grooming-in-a-barbershop-4341-large.mp4' },
  { stage: 4, range: [10, 10], url: 'https://assets.mixkit.co/videos/preview/mixkit-relaxed-man-getting-hairwashed-in-a-barbershop-4342-large.mp4' }
];

-- ── Copy profession from signup into the new profile ──
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, home_country, date_of_birth, profession)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'home_country',
    nullif(new.raw_user_meta_data->>'date_of_birth', '')::date,
    nullif(new.raw_user_meta_data->>'profession', '')
  );
  return new;
end;
$$ language plpgsql security definer;

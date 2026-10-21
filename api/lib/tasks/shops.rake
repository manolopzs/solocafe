namespace :shops do
  desc "Mark obvious test shops. DRY_RUN=1 lists matches without writing. Refuses to run in production."
  task flag_test_shops: :environment do
    dry_run = ENV["DRY_RUN"] == "1"
    Shop.flag_obvious_test_shops!(dry_run: dry_run).each { |line| puts line }
  end
end

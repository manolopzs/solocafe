module PublicHttpCache
  extend ActiveSupport::Concern

  private

  def render_public_json(payload, max_age: 30)
    body = ActiveSupport::JSON.encode(payload)
    etag = %("#{Digest::SHA256.hexdigest(body)}")
    response.set_header("ETag", etag)
    response.set_header("Cache-Control", "public, max-age=#{max_age}, stale-while-revalidate=120")

    if etag_matches?(etag)
      head :not_modified
      return
    end

    render body: body, content_type: "application/json; charset=utf-8"
  end

  def etag_matches?(etag)
    none_match = request.headers["If-None-Match"].to_s
    return false if none_match.blank?

    none_match.split(",").map(&:strip).any? { |candidate| candidate == etag || candidate == "*" }
  end
end

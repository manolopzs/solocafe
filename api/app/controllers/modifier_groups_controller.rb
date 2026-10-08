class ModifierGroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!, only: [:create, :update, :destroy]
  before_action :set_current_shop!, only: [:index]

  def index
    groups = Current.shop.modifier_groups.includes(:modifier_options).order(:sort_order)
    render json: { modifier_groups: groups.map { |g| group_payload(g) } }
  end

  def create
    group = nil
    ActiveRecord::Base.transaction do
      group = Current.shop.modifier_groups.create!(group_params)
      create_modifier_options(group, modifier_options_params)
    end
    render json: { modifier_group: group_payload(group) }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def update
    group = Current.shop.modifier_groups.find(params[:id])
    ActiveRecord::Base.transaction do
      group.update!(group_params)
      update_modifier_options(group, modifier_options_params)
    end
    render json: { modifier_group: group_payload(group) }
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def destroy
    group = Current.shop.modifier_groups.find(params[:id])
    group.destroy
    head :no_content
  end

  private

  def group_params
    params.require(:modifier_group).permit(:name, :min_select, :max_select, :sort_order)
  end

  def modifier_options_params
    params.require(:modifier_group)
          .permit(modifier_options: [:id, :name, :price_cents, :is_active, :sort_order, :_destroy])
          .fetch(:modifier_options, [])
  end

  def create_modifier_options(group, options_params)
    options_params.each do |option_attrs|
      group.modifier_options.create!(option_attrs.except(:id, :_destroy))
    end
  end

  def update_modifier_options(group, options_params)
    options_params.each do |option_attrs|
      id = option_attrs[:id]

      if ActiveModel::Type::Boolean.new.cast(option_attrs[:_destroy])
        option = group.modifier_options.find(id)
        option.destroy!
      elsif id.present?
        option = group.modifier_options.find(id)
        option.update!(option_attrs.except(:id, :_destroy))
      else
        group.modifier_options.create!(option_attrs.except(:id, :_destroy))
      end
    end
  end

  def group_payload(group)
    {
      id: group.id,
      name: group.name,
      min_select: group.min_select,
      max_select: group.max_select,
      sort_order: group.sort_order,
      modifier_options: group.modifier_options.map { |o| option_payload(o) }
    }
  end

  def option_payload(option)
    {
      id: option.id,
      name: option.name,
      price_cents: option.price_cents,
      is_active: option.is_active,
      sort_order: option.sort_order
    }
  end
end

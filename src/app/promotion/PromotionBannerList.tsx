import { Banner, Promotion } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import PromotionBanner from './PromotionBanner';

export interface PromotionBannerListProps {
    promotions: Promotion[];
}

const PromotionBannerList: FunctionComponent<PromotionBannerListProps> = ({
    promotions,
}) => {
    const banners = (promotions || []).reduce((result, promotion) => ([
        ...result,
        ...promotion.banners,
    ]), [] as Banner[]);

    if (!banners.length) {
        return null;
    }

    return (
        <div className="discountBanner">
            <ul className="discountBannerList">
                { banners.map((banner, index) => (
                    <PromotionBanner
                        key={ index }
                        message={ banner.text }
                    />
                )) }
            </ul>
        </div>
    );
};

export default memo(PromotionBannerList);

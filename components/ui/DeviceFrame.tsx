/**
 * Pure-CSS device mockups: an iMac (desktop screenshot) paired with an
 * iPhone 17 Pro (mobile screenshot), arranged Apple-style.
 */
export default function DeviceFrame({
  desktop,
  mobile,
  alt,
}: {
  desktop: string;
  mobile: string;
  alt: string;
}) {
  return (
    <div className="devices">
      <div className="imac" aria-hidden={false}>
        <div className="imac__screen">
          <span className="imac__cam" aria-hidden="true" />
          <div className="imac__shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={desktop} alt={`${alt} — escritorio`} loading="lazy" draggable={false} />
          </div>
        </div>
        <div className="imac__chin" aria-hidden="true" />
        <div className="imac__stand" aria-hidden="true" />
        <div className="imac__base" aria-hidden="true" />
      </div>

      <div className="iphone">
        <span className="iphone__island" aria-hidden="true" />
        <span className="iphone__btn iphone__btn--power" aria-hidden="true" />
        <span className="iphone__btn iphone__btn--vol-up" aria-hidden="true" />
        <span className="iphone__btn iphone__btn--vol-dn" aria-hidden="true" />
        <div className="iphone__shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mobile} alt={`${alt} — móvil`} loading="lazy" draggable={false} />
        </div>
      </div>
    </div>
  );
}

import { type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang + "/"}terms`;

  return {
    title: "Terms and Conditions - SSDown",
    description:
      "Read SSDown's terms and conditions of use. Understand the rules and guidelines for using our video downloader service.",
    openGraph: {
      title: "Terms and Conditions - SSDown",
      description:
        "Read SSDown's terms and conditions of use. Understand the rules and guidelines for using our video downloader service.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function TermsPage() {
  return (
    <div className="container py-12 md:py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions of Use</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
        <section>
          <p>
            Unless otherwise specified, the terms of use detailed in this
            section apply generally when using this Application.
          </p>
          <p>
            Single or additional conditions of use or access may apply in
            specific scenarios and in such cases are additionally indicated
            within this document.
          </p>
          <p>
            There are no restrictions for Users in terms of being Consumers or
            Business Users;
          </p>
          <p>
            By using this Application, Users confirm to meet the following
            requirements:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Users must be recognized as adult by applicable law;</li>
            <li>
              Users aren&rsquo;t located in a country that is subject to a U.S.
              Government embargo, or that has been designated by the U.S.
              Government as a &ldquo;terrorist-supporting&rdquo; country;
            </li>
            <li>
              Users aren&rsquo;t listed on any U.S. Government list of
              prohibited or restricted parties;
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Conditions for account registration
          </h2>
          <p>
            Registration of User accounts on this Application is subject to the
            conditions outlined below. By registering, Users agree to meet such
            conditions.
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              Accounts registered by bots or any other automated methods are not
              permitted.
            </li>
            <li>
              Unless otherwise specified, each User must register only one
              account.
            </li>
            <li>
              Unless explicitly permitted, a User account may not be shared with
              other persons.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Account registration
          </h2>
          <p>
            To use the Service Users may register or create a User account,
            providing all required data or information in a complete and
            truthful manner.
          </p>
          <p>
            Users may also use the Service without registering or creating a
            User account, however, this may cause limited availability of
            certain features or functions.
          </p>
          <p>
            Users are responsible for keeping their login credentials
            confidential and safe. For this reason, Users are also required to
            choose passwords that meet the highest standards of strength
            permitted by this Application.
          </p>
          <p>
            By registering, Users agree to be fully responsible for all
            activities that occur under their username and password.
          </p>
          <p>
            Users are required to immediately and unambiguously inform the Owner
            via the contact details indicated in this document, if they think
            their personal information, including but not limited to User
            accounts, access credentials or personal data, have been violated,
            unduly disclosed or stolen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Account termination
          </h2>
          <p>
            Users can terminate their account and stop using the Service at any
            time by doing the following:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              By directly contacting the Owner at the contact details provided
              in this document.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Account suspension and deletion
          </h2>
          <p>
            The Owner reserves the right, at its sole discretion, to suspend or
            delete at any time and without notice, User accounts which it deems
            inappropriate, offensive or in violation of these Terms.
          </p>
          <p>
            The suspension or deletion of User accounts shall not entitle Users
            to any claims for compensation, damages or reimbursement.
          </p>
          <p>
            The suspension or deletion of accounts due to causes attributable to
            the User does not exempt the User from paying any applicable fees or
            prices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Content on this Application
          </h2>
          <p>
            Unless where otherwise specified or clearly recognizable, all
            content available on this Application is owned or provided by the
            Owner or its licensors.
          </p>
          <p>
            The Owner undertakes its utmost effort to ensure that the content
            provided on this Application infringes no applicable legal
            provisions or third-party rights. However, it may not always be
            possible to achieve such a result.
          </p>
          <p>
            In such cases, without prejudice to any legal prerogatives of Users
            to enforce their rights, Users are kindly asked to preferably report
            related complaints using the contact details provided in this
            document.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Rights regarding content on this Application - All rights reserved
          </h2>
          <p>
            The Owner holds and reserves all intellectual property rights for
            any such content.
          </p>
          <p>
            Users may not therefore use such content in any way that is not
            necessary or implicit in the proper use of the Service.
          </p>
          <p>
            In particular, but without limitation, Users may not copy, download,
            share (beyond the limits set forth below), modify, translate,
            transform, publish, transmit, sell, sublicense, edit,
            transfer/assign to third parties or create derivative works from the
            content available on this Application, nor allow any third party to
            do so through the User or their device, even without the
            User&rsquo;s knowledge.
          </p>
          <p>
            Where explicitly stated on this Application, the User may download,
            copy and/or share some content available through this Application
            for its sole personal and non-commercial use and provided that the
            copyright attributions and all the other attributions requested by
            the Owner are correctly implemented.
          </p>
          <p>
            Any applicable statutory limitation or exception to copyright shall
            stay unaffected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Content provided by Users
          </h2>
          <p>
            The Owner allows Users to upload, share or provide their own content
            to this Application.
          </p>
          <p>
            By providing content to this Application, Users confirm that they
            are legally allowed to do so and that they are not infringing any
            statutory provisions and/or third-party rights.
          </p>
          <p>
            Further insights regarding acceptable content can be found inside
            the section of these Terms which detail the acceptable uses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Rights regarding content provided by Users
          </h2>
          <p>
            Users acknowledge and accept that by providing their own content on
            this Application they grant the Owner a non-exclusive, fully paid-up
            and royalty-free license to process such content solely for the
            operation and maintenance of this Application as contractually
            required.
          </p>
          <p>
            To the extent permitted by applicable law, Users waive any moral
            rights in connection with content they provide to this Application.
          </p>
          <p>
            Users acknowledge, accept and confirm that all content they provide
            through this Application is provided subject to the same general
            conditions set forth for content on this Application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Liability for provided content
          </h2>
          <p>
            Users are solely liable for any content they upload, post, share, or
            provide through this Application. Users acknowledge and accept that
            the Owner does not filter or moderate such content.
          </p>
          <p>
            However, the Owner reserves the right to remove, delete, block or
            rectify such content at its own discretion and to, without prior
            notice, deny the uploading User access to this Application:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>if any complaint based on such content is received;</li>
            <li>
              if a notice of infringement of intellectual property rights is
              received;
            </li>
            <li>upon order of a public authority; or</li>
            <li>
              where the Owner is made aware that the content, while being
              accessible via this Application, may represent a risk for Users,
              third parties and/or the availability of the Service.
            </li>
          </ul>
          <p>
            The removal, deletion, blocking or rectification of content shall
            not entitle Users that have provided such content or that are liable
            for it, to any claims for compensation, damages or reimbursement.
          </p>
          <p>
            Users agree to hold the Owner harmless from and against any claim
            asserted and/or damage suffered due to content they provided to or
            provided through this Application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Removal of content from parts of this Application available through
            the App Store
          </h2>
          <p>
            If the reported content is deemed objectionable, it will be removed
            within 24 hours and the User who provided the content will be barred
            from using the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Access to provided content
          </h2>
          <p>
            Content that Users provide to this Application is made available
            according to the criteria outlined within this section.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Publicly available content
          </h3>
          <p>
            Content meant for public availability shall be automatically made
            public on this Application upon upload or, at the sole discretion of
            the Owner, at a later stage.
          </p>
          <p>
            No personal data, identifier or any other information related to
            Users, except for a pseudonym of their choice (such as a nickname or
            avatar) shall appear in connection with the published content,
            unless Users decide otherwise on their own initiative.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Private content
          </h3>
          <p>
            Private content provided by Users shall stay private and will not be
            shared with any third parties or accessed by the Owner without the
            User&rsquo;s explicit consent.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Content for determined audiences
          </h3>
          <p>
            Content meant to be made available to specific audiences may only be
            shared with such third parties as determined by Users.
          </p>
          <p>
            No personal data, identifier or any other information related to
            Users, except for a pseudonym of their choice (such as a nickname or
            avatar) shall appear in connection with the content, unless Users
            decide otherwise on their own initiative.
          </p>
          <p>
            Users may (and are encouraged to) check on this Application to find
            details of who can access the content they provide.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Access to external resources
          </h2>
          <p>
            Through this Application Users may have access to external resources
            provided by third parties. Users acknowledge and accept that the
            Owner has no control over such resources and is therefore not
            responsible for their content and availability.
          </p>
          <p>
            Conditions applicable to any resources provided by third parties,
            including those applicable to any possible grant of rights in
            content, result from each such third parties&rsquo; terms and
            conditions or, in the absence of those, applicable statutory law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How to file a takedown notice (called a &ldquo;DMCA notice&rdquo;)
          </h2>
          <p>
            If copyright holders or their agents believe that any content on
            this Application infringes upon their copyrights, they may submit a
            notification pursuant to the Digital Millennium Copyright Act
            (&quot;DMCA&quot;) by providing the Owner&rsquo;s Copyright Agent
            with the following information in writing (see 17 U.S.C 512(c)(3)
            for further detail):
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              A physical or electronic signature of a person authorized to act
              on behalf of the holder of an exclusive right that is allegedly
              infringed;
            </li>
            <li>
              Identification of the copyrighted work claimed to have been
              infringed, or, if multiple copyrighted works at a single online
              site are covered by a single notification, a representative list
              of such works at that site;
            </li>
            <li>
              Identification of the material that is claimed to be infringing or
              to be the subject of infringing activity and that is to be removed
              or access to which is to be disabled and information reasonably
              sufficient to permit the Owner to locate the material;
            </li>
            <li>
              Information reasonably sufficient to permit the Owner to contact
              the notifying party, such as an address, telephone number, and, if
              available, an electronic mail;
            </li>
            <li>
              A statement that the notifying party has a good faith belief that
              use of the material in the manner complained of is not authorized
              by the copyright owner, its agent, or the law; and
            </li>
            <li>
              A statement that the information in the notification is accurate,
              and under penalty of perjury, that the notifying party is
              authorized to act on behalf of the owner of an exclusive right
              that is allegedly infringed.
            </li>
          </ul>
          <p>
            Failure to comply with all of the requirements outlined above may
            result in invalidity of the DMCA notice.
          </p>
          <p>
            Copyright infringement notifications may be addressed to the
            Owner&rsquo;s Copyright Agent at the contact details specified in
            this document.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Acceptable use
          </h2>
          <p>
            This Application and the Service may only be used within the scope
            of what they are provided for, under these Terms and applicable law.
          </p>
          <p>
            Users are solely responsible for making sure that their use of this
            Application and/or the Service violates no applicable law,
            regulations or third-party rights.
          </p>
          <p>
            Therefore, the Owner reserves the right to take any appropriate
            measure to protect its legitimate interests including by denying
            Users access to this Application or the Service, terminating
            contracts, reporting any misconduct performed through this
            Application or the Service to the competent authorities – such as
            judicial or administrative authorities - whenever Users engage or
            are suspected to engage in any of the following activities:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>violate laws, regulations and/or these Terms;</li>
            <li>infringe any third-party rights;</li>
            <li>considerably impair the Owner&rsquo;s legitimate interests;</li>
            <li>offend the Owner or any third party.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Purchase via app store
          </h2>
          <p>
            This Application or specific Products available for sale on this
            Application must be purchased via a third-party app store. To access
            such purchases, Users must follow the instructions provided on the
            relevant online store (such as &quot;Apple App Store&quot; or
            &quot;Google Play&quot;), which may vary depending on the particular
            device in use.
          </p>
          <p>
            Unless otherwise specified, purchases done via third-party online
            stores are also subject to such third-parties&rsquo; terms and
            conditions, which, in case of any inconsistency or conflict, shall
            always prevail upon these Terms.
          </p>
          <p>
            Users purchasing through such third-party online stores must
            therefore read such terms and conditions of sale carefully and
            accept them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Contract duration
          </h2>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Subscriptions
          </h3>
          <p>
            Subscriptions allow Users to receive a Product continuously or
            regularly over a determined period of time.
          </p>
          <p>
            Paid subscriptions begin on the day the payment is received by the
            Owner.
          </p>
          <p>
            In order to maintain subscriptions, Users must pay the required
            recurring fee in a timely manner. Failure to do so may cause service
            interruptions.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Subscriptions handled via Apple ID
          </h3>
          <p>
            Users may subscribe to a Product using the Apple ID associated with
            their Apple App Store account by using the relevant process on this
            Application. When doing so, Users acknowledge and accept that
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>any payment due shall be charged to their Apple ID account;</li>
            <li>
              subscriptions are automatically renewed for the same duration
              unless the User cancels at least 24 hours before the current
              period expires;
            </li>
            <li>
              any and all fees or payments due for renewal will be charged
              within 24-hours before the end of the current period;
            </li>
            <li>
              subscriptions can be managed or cancelled in the Users&rsquo;
              Apple App Store account settings.
            </li>
          </ul>
          <p>
            The above shall prevail upon any conflicting or diverging provision
            of these Terms.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Termination
          </h3>
          <p>
            Recurring subscriptions may be terminated at any time by sending a
            clear and unambiguous termination notice to the Owner using the
            contact details provided in this document, or — if applicable — by
            using the corresponding controls inside this Application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Liability and indemnification
          </h2>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Australian Users
          </h3>
          <h4 className="font-medium text-foreground italic mt-2">
            Limitation of liability
          </h4>
          <p>
            Nothing in these Terms excludes, restricts or modifies any
            guarantee, condition, warranty, right or remedy which the User may
            have under the Competition and Consumer Act 2010 (Cth) or any
            similar State and Territory legislation and which cannot be
            excluded, restricted or modified (non-excludable right). To the
            fullest extent permitted by law, our liability to the User,
            including liability for a breach of a non-excludable right and
            liability which is not otherwise excluded under these Terms of Use,
            is limited, at the Owner&rsquo;s sole discretion, to the
            re-performance of the services or the payment of the cost of having
            the services supplied again.
          </p>

          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            US Users
          </h3>
          <h4 className="font-medium text-foreground italic mt-2">
            Disclaimer of Warranties
          </h4>
          <p className="uppercase">
            This Application is provided strictly on an &ldquo;as is&rdquo; and
            &ldquo;as available&rdquo; basis. Use of the Service is at
            Users&rsquo; own risk. To the maximum extent permitted by applicable
            law, the Owner expressly disclaims all conditions, representations,
            and warranties — whether express, implied, statutory or otherwise,
            including, but not limited to, any implied warranty of
            merchantability, fitness for a particular purpose, or
            non-infringement of third-party rights. No advice or information,
            whether oral or written, obtained by user from owner or through the
            Service will create any warranty not expressly stated herein.
          </p>
          <p>
            Without limiting the foregoing, the Owner, its subsidiaries,
            affiliates, licensors, officers, directors, agents, co-branders,
            partners, suppliers and employees do not warrant that the content is
            accurate, reliable or correct; that the Service will meet
            Users&rsquo; requirements; that the Service will be available at any
            particular time or location, uninterrupted or secure; that any
            defects or errors will be corrected; or that the Service is free of
            viruses or other harmful components. Any content downloaded or
            otherwise obtained through the use of the Service is downloaded at
            users own risk and users shall be solely responsible for any damage
            to Users&rsquo; computer system or mobile device or loss of data
            that results from such download or Users&rsquo; use of the Service.
          </p>
          <p>
            The Owner does not warrant, endorse, guarantee, or assume
            responsibility for any product or service advertised or offered by a
            third party through the Service or any hyperlinked website or
            service, and the Owner shall not be a party to or in any way monitor
            any transaction between Users and third-party providers of products
            or services.
          </p>
          <p>
            The Service may become inaccessible or it may not function properly
            with Users&rsquo; web browser, mobile device, and/or operating
            system. The owner cannot be held liable for any perceived or actual
            damages arising from Service content, operation, or use of this
            Service.
          </p>
          <p>
            Federal law, some states, and other jurisdictions, do not allow the
            exclusion and limitations of certain implied warranties. The above
            exclusions may not apply to Users. This Agreement gives Users
            specific legal rights, and Users may also have other rights which
            vary from state to state. The disclaimers and exclusions under this
            agreement shall not apply to the extent prohibited by applicable
            law.
          </p>

          <h4 className="font-medium text-foreground italic mt-2">
            Limitations of liability
          </h4>
          <p>
            To the maximum extent permitted by applicable law, in no event shall
            the Owner, and its subsidiaries, affiliates, officers, directors,
            agents, co-branders, partners, suppliers and employees be liable for
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              any indirect, punitive, incidental, special, consequential or
              exemplary damages, including without limitation damages for loss
              of profits, goodwill, use, data or other intangible losses,
              arising out of or relating to the use of, or inability to use, the
              Service; and
            </li>
            <li>
              any damage, loss or injury resulting from hacking, tampering or
              other unauthorized access or use of the Service or User account or
              the information contained therein;
            </li>
            <li>any errors, mistakes, or inaccuracies of content;</li>
            <li>
              personal injury or property damage, of any nature whatsoever,
              resulting from User access to or use of the Service;
            </li>
            <li>
              any unauthorized access to or use of the Owner&rsquo;s secure
              servers and/or any and all personal information stored therein;
            </li>
            <li>
              any interruption or cessation of transmission to or from the
              Service;
            </li>
            <li>
              any bugs, viruses, trojan horses, or the like that may be
              transmitted to or through the Service;
            </li>
            <li>
              any errors or omissions in any content or for any loss or damage
              incurred as a result of the use of any content posted, emailed,
              transmitted, or otherwise made available through the Service;
              and/or
            </li>
            <li>
              the defamatory, offensive, or illegal conduct of any User or third
              party. In no event shall the Owner, and its subsidiaries,
              affiliates, officers, directors, agents, co-branders, partners,
              suppliers and employees be liable for any claims, proceedings,
              liabilities, obligations, damages, losses or costs in an amount
              exceeding the amount paid by User to the Owner hereunder in the
              preceding 12 months, or the period of duration of this agreement
              between the Owner and User, whichever is shorter.
            </li>
          </ul>
          <p>
            This limitation of liability section shall apply to the fullest
            extent permitted by law in the applicable jurisdiction whether the
            alleged liability is based on contract, tort, negligence, strict
            liability, or any other basis, even if company has been advised of
            the possibility of such damage.
          </p>
          <p>
            Some jurisdictions do not allow the exclusion or limitation of
            incidental or consequential damages, therefore the above limitations
            or exclusions may not apply to User. The terms give User specific
            legal rights, and User may also have other rights which vary from
            jurisdiction to jurisdiction. The disclaimers, exclusions, and
            limitations of liability under the terms shall not apply to the
            extent prohibited by applicable law.
          </p>

          <h4 className="font-medium text-foreground italic mt-2">
            Indemnification
          </h4>
          <p>
            The User agrees to defend, indemnify and hold the Owner and its
            subsidiaries, affiliates, officers, directors, agents, co-branders,
            partners, suppliers and employees harmless from and against any and
            all claims or demands, damages, obligations, losses, liabilities,
            costs or debt, and expenses, including, but not limited to, legal
            fees and expenses, arising from
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              User&rsquo;s use of and access to the Service, including any data
              or content transmitted or received by User;
            </li>
            <li>
              User&rsquo;s violation of these terms, including, but not limited
              to, User&rsquo;s breach of any of the representations and
              warranties set forth in these terms;
            </li>
            <li>
              User&rsquo;s violation of any third-party rights, including, but
              not limited to, any right of privacy or intellectual property
              rights;
            </li>
            <li>
              User&rsquo;s violation of any statutory law, rule, or regulation;
            </li>
            <li>
              any content that is submitted from User&rsquo;s account, including
              third party access with User&rsquo;s unique username, password or
              other security measure, if applicable, including, but not limited
              to, misleading, false, or inaccurate information;
            </li>
            <li>User&rsquo;s wilful misconduct; or</li>
            <li>
              statutory provision by User or its affiliates, officers,
              directors, agents, co-branders, partners, suppliers and employees
              to the extent allowed by applicable law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Common provisions
          </h2>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            No Waiver
          </h3>
          <p>
            The Owner&rsquo;s failure to assert any right or provision under
            these Terms shall not constitute a waiver of any such right or
            provision. No waiver shall be considered a further or continuing
            waiver of such term or any other term.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Service interruption
          </h3>
          <p>
            To ensure the best possible service level, the Owner reserves the
            right to interrupt the Service for maintenance, system updates or
            any other changes, informing the Users appropriately.
          </p>
          <p>
            Within the limits of law, the Owner may also decide to suspend or
            terminate the Service altogether. If the Service is terminated, the
            Owner will cooperate with Users to enable them to withdraw Personal
            Data or information in accordance with applicable law.
          </p>
          <p>
            Additionally, the Service might not be available due to reasons
            outside the Owner&rsquo;s reasonable control, such as &ldquo;force
            majeure&rdquo; (eg. labor actions, infrastructural breakdowns or
            blackouts etc).
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Service reselling
          </h3>
          <p>
            Users may not reproduce, duplicate, copy, sell, resell or exploit
            any portion of this Application and of its Service without the
            Owner&rsquo;s express prior written permission, granted either
            directly or through a legitimate reselling programme.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Privacy policy
          </h3>
          <p>
            To learn more about the use of their Personal Data, Users may refer
            to the privacy policy of this Application.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Intellectual property rights
          </h3>
          <p>
            Without prejudice to any more specific provision of these Terms, any
            intellectual property rights, such as copyrights, trademark rights,
            patent rights and design rights related to this Application are the
            exclusive property of the Owner or its licensors and are subject to
            the protection granted by applicable laws or international treaties
            relating to intellectual property.
          </p>
          <p>
            All trademarks — nominal or figurative — and all other marks, trade
            names, service marks, word marks, illustrations, images, or logos
            appearing in connection with this Application are, and remain, the
            exclusive property of the Owner or its licensors and are subject to
            the protection granted by applicable laws or international treaties
            related to intellectual property.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Changes to these Terms
          </h3>
          <p>
            The Owner reserves the right to amend or otherwise modify these
            Terms at any time. In such cases, the Owner will appropriately
            inform the User of these changes.
          </p>
          <p>
            Such changes will only affect the relationship with the User for the
            future.
          </p>
          <p>
            The continued use of the Service will signify the User&rsquo;s
            acceptance of the revised Terms. If Users do not wish to be bound by
            the changes, they must stop using the Service. Failure to accept the
            revised Terms, may entitle either party to terminate the Agreement.
          </p>
          <p>
            The applicable previous version will govern the relationship prior
            to the User&rsquo;s acceptance. The User can obtain any previous
            version from the Owner.
          </p>
          <p>
            If required by applicable law, the Owner will specify the date by
            which the modified Terms will enter into force.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Assignment of contract
          </h3>
          <p>
            The Owner reserves the right to transfer, assign, dispose of by
            novation, or subcontract any or all rights or obligations under
            these Terms, taking the User&rsquo;s legitimate interests into
            account. Provisions regarding changes of these Terms will apply
            accordingly.
          </p>
          <p>
            Users may not assign or transfer their rights or obligations under
            these Terms in any way, without the written permission of the Owner.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Contacts
          </h3>
          <p>
            All communications relating to the use of this Application must be
            sent using the contact information stated in this document.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Severability
          </h3>
          <p>
            Should any provision of these Terms be deemed or become invalid or
            unenforceable under applicable law, the invalidity or
            unenforceability of such provision shall not affect the validity of
            the remaining provisions, which shall remain in full force and
            effect.
          </p>
          <h4 className="font-medium text-foreground italic mt-2">US Users</h4>
          <p>
            Any such invalid or unenforceable provision will be interpreted,
            construed and reformed to the extent reasonably required to render
            it valid, enforceable and consistent with its original intent. These
            Terms constitute the entire Agreement between Users and the Owner
            with respect to the subject matter hereof, and supersede all other
            communications, including but not limited to all prior agreements,
            between the parties with respect to such subject matter. These Terms
            will be enforced to the fullest extent permitted by law.
          </p>
          <h4 className="font-medium text-foreground italic mt-2">EU Users</h4>
          <p>
            Should any provision of these Terms be or be deemed void, invalid or
            unenforceable, the parties shall do their best to find, in an
            amicable way, an agreement on valid and enforceable provisions
            thereby substituting the void, invalid or unenforceable parts.
          </p>
          <p>
            In case of failure to do so, the void, invalid or unenforceable
            provisions shall be replaced by the applicable statutory provisions,
            if so permitted or stated under the applicable law.
          </p>
          <p>
            Without prejudice to the above, the nullity, invalidity or the
            impossibility to enforce a particular provision of these Terms shall
            not nullify the entire Agreement, unless the severed provisions are
            essential to the Agreement, or of such importance that the parties
            would not have entered into the contract if they had known that the
            provision would not be valid, or in cases where the remaining
            provisions would translate into an unacceptable hardship on any of
            the parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Governing law
          </h2>
          <p>
            These Terms are governed by the law of the place where the Owner is
            based, as disclosed in the relevant section of this document,
            without regard to conflict of laws principles.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Exception for European Consumers
          </h3>
          <p>
            However, regardless of the above, if the User qualifies as a
            European Consumer and has their habitual residence in a country
            where the law provides for a higher consumer protection standard,
            such higher standards shall prevail.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Venue of jurisdiction
          </h2>
          <p>
            The exclusive competence to decide on any controversy resulting from
            or connected to these Terms lies with the courts of the place where
            the Owner is based, as displayed in the relevant section of this
            document.
          </p>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Exception for European Consumers
          </h3>
          <p>
            The above does not apply to any Users that qualify as European
            Consumers, nor to Consumers based in Switzerland, Norway or Iceland.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Definitions and legal references
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-foreground">
                This Application (or this Application)
              </dt>
              <dd>The property that enables the provision of the Service.</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Agreement</dt>
              <dd>
                Any legally binding or contractual relationship between the
                Owner and the User, governed by these Terms.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Business User</dt>
              <dd>Any User that does not qualify as a Consumer.</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                European (or Europe)
              </dt>
              <dd>
                Applies where a User is physically present or has their
                registered offices within the EU, regardless of nationality.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Owner (or We)</dt>
              <dd>
                Indicates the natural person(s) or legal entity that provides
                this Application and/or the Service to Users.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Service</dt>
              <dd>
                The service provided by this Application as described in these
                Terms and on this Application.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Terms</dt>
              <dd>
                All provisions applicable to the use of this Application and/or
                the Service as described in this document, including any other
                related documents or agreements, and as updated from time to
                time.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">User (or You)</dt>
              <dd>
                Indicates any natural person or legal entity using this
                Application.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Consumer</dt>
              <dd>
                Any User qualifying as a natural person who accesses goods or
                services for personal use, or more generally, acts for purposes
                outside their trade, business, craft or profession.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

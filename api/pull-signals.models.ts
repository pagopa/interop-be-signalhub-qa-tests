/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type SignalType = "CREATE" | "UPDATE" | "DELETE" | "SEEDUPDATE";

export interface SignalPullResponse {
  signals: {
    signalType: SignalType;
    objectId: string;
    eserviceId: string;
    signalId: number;
    objectType: string;
  }[];
  lastSignalId?: number | null;
}

export interface Problem {
  type: string;
  status: number;
  title: string;
  correlationId?: string | null;
  detail: string;
  errors: {
    code: string;
    detail: string;
  }[];
}

export interface PullSignalParams {
  /**
   * @min 0
   * @default 0
   */
  signalId?: number | null;
  /**
   * @min 1
   * @max 100
   * @default 10
   */
  size?: number;
  eserviceId: string;
}

export namespace V1 {
  /**
   * @description Should return OK
   * @name GetStatus
   * @summary Health status endpoint
   * @request GET:/v1/pull/status
   */
  export namespace GetStatus {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = "OK";
  }
  /**
   * @description Retrieve a list o signals on a specific eservice starting from signalId
   * @name PullSignal
   * @summary Get a list of signals
   * @request GET:/v1/pull/signals/{eserviceId}
   */
  export namespace PullSignal {
    export type RequestParams = {
      eserviceId: string;
    };
    export type RequestQuery = {
      /**
       * @min 0
       * @default 0
       */
      signalId?: number | null;
      /**
       * @min 1
       * @max 100
       * @default 10
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {
      authorization: string;
    };
    export type ResponseBody = SignalPullResponse;
  }
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "https://api.signalhub.interop.pagopa.it",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Pull signal Service API
 * @version 1.1.0
 * @license ISC (https://opensource.org/license/isc-license-txt)
 * @termsOfService https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti
 * @baseUrl https://api.signalhub.interop.pagopa.it
 *
 * Exposes the API for Signal-hub pull service
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v1 = {
    /**
     * @description Should return OK
     *
     * @name GetStatus
     * @summary Health status endpoint
     * @request GET:/v1/pull/status
     */
    getStatus: (params: RequestParams = {}) =>
      this.request<"OK", any>({
        path: `/v1/pull/status`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a list o signals on a specific eservice starting from signalId
     *
     * @name PullSignal
     * @summary Get a list of signals
     * @request GET:/v1/pull/signals/{eserviceId}
     */
    pullSignal: ({ eserviceId, ...query }: PullSignalParams, params: RequestParams = {}) =>
      this.request<SignalPullResponse, Problem>({
        path: `/v1/pull/signals/${eserviceId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
